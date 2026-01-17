import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Search as SearchIcon, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

const Search = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search
  useState(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);
    return () => clearTimeout(timer);
  });

  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['search-restaurants', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .eq('is_active', true)
        .ilike('name', `%${debouncedQuery}%`)
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!debouncedQuery,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['search-products', debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*, sub_categories(id, name)')
        .eq('is_active', true)
        .ilike('name', `%${debouncedQuery}%`)
        .limit(10);
      if (error) throw error;
      return data;
    },
    enabled: !!debouncedQuery,
  });

  const isLoading = loadingRestaurants || loadingProducts;
  const hasResults = (restaurants && restaurants.length > 0) || (products && products.length > 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center gap-3 h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <div className="flex-1 relative">
            <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن مطعم أو وجبة..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setTimeout(() => setDebouncedQuery(e.target.value), 300);
              }}
              className="pr-10 pl-10 h-11 rounded-xl"
              autoFocus
            />
            {query && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2 h-8 w-8"
                onClick={() => {
                  setQuery('');
                  setDebouncedQuery('');
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container p-4">
        {!debouncedQuery ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-xl font-bold mb-2">ابحث عن أي شيء</h2>
            <p className="text-muted-foreground">
              اكتب اسم مطعم أو وجبة للبحث
            </p>
          </motion.div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 bg-card rounded-xl">
                <Skeleton className="w-16 h-16 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        ) : hasResults ? (
          <div className="space-y-6">
            {/* Restaurants */}
            {restaurants && restaurants.length > 0 && (
              <section>
                <h2 className="font-bold mb-3">المطاعم</h2>
                <div className="space-y-3">
                  {restaurants.map((restaurant) => (
                    <motion.div
                      key={restaurant.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4 bg-card rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/restaurant/${restaurant.id}`)}
                    >
                      <img
                        src={restaurant.image_url || '/placeholder.svg'}
                        alt={restaurant.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold">{restaurant.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {restaurant.cuisine_type || 'مطعم'}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Products */}
            {products && products.length > 0 && (
              <section>
                <h2 className="font-bold mb-3">الأصناف</h2>
                <div className="space-y-3">
                  {products.map((product: any) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4 bg-card rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => navigate(`/restaurant/${product.sub_category_id}`)}
                    >
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="font-bold">{product.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {product.sub_categories?.name}
                        </p>
                        <p className="text-sm font-bold text-primary mt-1">
                          {product.price} ج.م
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold mb-2">لا توجد نتائج</h2>
            <p className="text-muted-foreground">
              جرب كلمات بحث مختلفة
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Search;
