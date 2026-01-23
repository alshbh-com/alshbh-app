import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Star, Clock, MapPin, Phone, Plus, Minus, ShoppingBag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { FloatingCartButton } from '@/components/FloatingCartButton';

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sizes_and_prices: unknown;
}

const RestaurantDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedSize, setSelectedSize] = useState<{ name: string; price: number } | null>(null);
  const [quantity, setQuantity] = useState(1);

  const { data: restaurant, isLoading: loadingRestaurant } = useQuery({
    queryKey: ['restaurant', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sub_category_id', id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data || []) as Product[];
    },
    enabled: !!id,
  });

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const price = selectedSize?.price || selectedProduct.price;
    const sizeName = selectedSize?.name || '';
    
    addItem({
      productId: selectedProduct.id,
      name: selectedProduct.name,
      price,
      image: selectedProduct.image_url || undefined,
      quantity,
      restaurantId: id!,
      restaurantName: restaurant?.name || '',
      size: sizeName,
    });
    
    toast.success('تمت الإضافة إلى السلة');
    setSelectedProduct(null);
    setSelectedSize(null);
    setQuantity(1);
  };

  const parseSizes = (product: Product) => {
    if (!product.sizes_and_prices) return [];
    if (Array.isArray(product.sizes_and_prices)) return product.sizes_and_prices;
    return [];
  };

  if (loadingRestaurant) {
    return (
      <div className="min-h-screen bg-background">
        <Skeleton className="h-56 w-full" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😕</div>
          <h2 className="text-xl font-bold mb-2">المطعم غير موجود</h2>
          <Button onClick={() => navigate('/')}>العودة للرئيسية</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header Image */}
      <div className="relative h-56">
        <img
          src={restaurant.image_url || '/placeholder.svg'}
          alt={restaurant.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Back Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
        >
          <ArrowRight className="w-5 h-5" />
        </Button>

        {/* Restaurant Info Overlay */}
        <div className="absolute bottom-4 right-4 left-4 text-white">
          <h1 className="text-2xl font-bold mb-1">{restaurant.name}</h1>
          <p className="text-sm opacity-90">{restaurant.cuisine_type || 'مطعم'}</p>
        </div>
      </div>

      {/* Restaurant Details */}
      <div className="p-4 border-b">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-warning fill-warning" />
            <span>{restaurant.average_rating?.toFixed(1) || '4.5'}</span>
            <span>({restaurant.review_count || 0})</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{restaurant.delivery_time_min || 30}-{restaurant.delivery_time_max || 45} دقيقة</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>توصيل {restaurant.delivery_fee || 10} ج.م</span>
          </div>
        </div>
        {restaurant.description && (
          <p className="mt-2 text-sm text-muted-foreground">{restaurant.description}</p>
        )}
      </div>

      {/* Products */}
      <div className="p-4">
        <h2 className="text-lg font-bold mb-4">قائمة الطعام</h2>
        
        {loadingProducts ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 bg-card rounded-xl">
                <Skeleton className="w-24 h-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="space-y-4">
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-4 p-4 bg-card rounded-xl shadow-soft cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  setSelectedProduct(product);
                  const sizes = parseSizes(product);
                  if (sizes.length > 0) {
                    setSelectedSize(sizes[0]);
                  }
                }}
              >
                <img
                  src={product.image_url || '/placeholder.svg'}
                  alt={product.name}
                  className="w-24 h-24 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h3 className="font-bold">{product.name}</h3>
                  {product.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                  )}
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-bold text-primary">{product.price} ج.م</span>
                    <Button size="sm" className="rounded-full">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🍽️</div>
            <p className="text-muted-foreground">لا توجد منتجات متاحة حالياً</p>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex items-end"
            onClick={() => setSelectedProduct(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full bg-background rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedProduct.image_url || '/placeholder.svg'}
                alt={selectedProduct.name}
                className="w-full h-48 rounded-xl object-cover mb-4"
              />
              
              <h2 className="text-xl font-bold mb-2">{selectedProduct.name}</h2>
              {selectedProduct.description && (
                <p className="text-muted-foreground mb-4">{selectedProduct.description}</p>
              )}

              {/* Sizes */}
              {parseSizes(selectedProduct).length > 0 && (
                <div className="mb-4">
                  <h3 className="font-bold mb-2">اختر الحجم</h3>
                  <div className="flex flex-wrap gap-2">
                    {parseSizes(selectedProduct).map((size) => (
                      <Button
                        key={size.name}
                        variant={selectedSize?.name === size.name ? 'default' : 'outline'}
                        onClick={() => setSelectedSize(size)}
                        className="rounded-full"
                      >
                        {size.name} - {size.price} ج.م
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center justify-between mb-6">
                <span className="font-bold">الكمية</span>
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-full"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="text-xl font-bold w-8 text-center">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-full"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart Button */}
              <Button
                className="w-full h-14 text-lg rounded-xl"
                onClick={handleAddToCart}
              >
                <ShoppingBag className="w-5 h-5 ml-2" />
                إضافة للسلة - {((selectedSize?.price || selectedProduct.price) * quantity).toFixed(0)} ج.م
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Cart Button */}
      <FloatingCartButton />
    </div>
  );
};

export default RestaurantDetails;
