import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Clock, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export const FeaturedRestaurants = () => {
  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['featured-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .eq('is_active', true)
        .order('average_rating', { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <section className="py-4 px-4">
        <div className="container">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="min-w-[200px] h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!restaurants || restaurants.length === 0) return null;

  return (
    <section className="py-4 px-4">
      <div className="container">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-warning" />
          <h2 className="text-lg font-bold">المطاعم المميزة</h2>
        </div>
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2">
          {restaurants.map((restaurant, index) => (
            <motion.div
              key={restaurant.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={`/restaurant/${restaurant.id}`}
                className="block min-w-[200px] bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-shadow"
              >
                <div className="relative aspect-[4/3]">
                  <img
                    src={restaurant.image_url || '/placeholder.svg'}
                    alt={restaurant.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-warning/90 text-warning-foreground px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    مميز
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-sm mb-1">{restaurant.name}</h3>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-warning fill-warning" />
                      <span>{restaurant.average_rating?.toFixed(1) || '4.5'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{restaurant.delivery_time_min || 30}-{restaurant.delivery_time_max || 45} د</span>
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
