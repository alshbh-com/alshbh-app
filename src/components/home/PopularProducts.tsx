import { motion } from 'framer-motion';
import { TrendingUp, Plus } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

export const PopularProducts = () => {
  const addItem = useCartStore((state) => state.addItem);

  const { data: products, isLoading } = useQuery({
    queryKey: ['popular-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, sub_categories(name)')
        .eq('is_active', true)
        .order('review_count', { ascending: false })
        .limit(6);

      if (error) throw error;
      return data;
    },
  });

  const handleAddToCart = (product: typeof products[number]) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image_url || undefined,
      quantity: 1,
    });
    toast.success('تمت الإضافة للسلة');
  };

  if (isLoading) {
    return (
      <section className="py-4 px-4">
        <div className="container">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-32 h-6" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!products || products.length === 0) return null;

  return (
    <section className="py-4 px-4">
      <div className="container">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-bold">الأكثر طلباً</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-2xl overflow-hidden shadow-soft"
            >
              <div className="relative aspect-square">
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                <Button
                  size="icon"
                  className="absolute bottom-2 left-2 w-8 h-8 rounded-full shadow-elevated"
                  onClick={() => handleAddToCart(product)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="p-3">
                <h3 className="font-bold text-sm mb-1 line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-1">
                  {(product as typeof product & { sub_categories?: { name: string } }).sub_categories?.name}
                </p>
                <p className="text-primary font-bold">{product.price} ج.م</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
