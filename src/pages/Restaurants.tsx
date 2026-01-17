import { AppLayout } from '@/components/layout/AppLayout';
import { CategoryCard } from '@/components/home/CategoryCard';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';

const fetchRestaurants = async () => {
  const { data, error } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
};

const Restaurants = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showOpenOnly, setShowOpenOnly] = useState(false);

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });

  const filteredRestaurants = restaurants?.filter((r) => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOpen = !showOpenOnly || r.is_open;
    return matchesSearch && matchesOpen;
  });

  return (
    <AppLayout showSearch={false}>
      <div className="container py-6 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl font-bold mb-4">جميع المطاعم</h1>
          
          {/* Search & Filter */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن مطعم..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pr-10 pl-4 rounded-xl bg-card border border-input focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <Button
              variant={showOpenOnly ? 'default' : 'outline'}
              onClick={() => setShowOpenOnly(!showOpenOnly)}
              className="shrink-0"
            >
              <Filter className="w-4 h-4 ml-2" />
              مفتوح الآن
            </Button>
          </div>
        </motion.div>

        {/* Restaurants Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl overflow-hidden">
                <Skeleton className="aspect-[16/10]" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredRestaurants && filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRestaurants.map((restaurant, index) => (
              <CategoryCard
                key={restaurant.id}
                id={restaurant.id}
                name={restaurant.name}
                image={restaurant.image_url || undefined}
                description={restaurant.description || undefined}
                rating={restaurant.average_rating || 4.5}
                deliveryTime={
                  restaurant.delivery_time_min && restaurant.delivery_time_max
                    ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max}`
                    : '30-45'
                }
                deliveryFee={restaurant.delivery_fee || 10}
                isOpen={restaurant.is_open ?? true}
                index={index}
              />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">لا توجد نتائج</h3>
            <p className="text-muted-foreground">
              جرب البحث بكلمات مختلفة
            </p>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default Restaurants;