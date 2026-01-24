import { AppLayout } from '@/components/layout/AppLayout';
import { HeroBanner } from '@/components/home/HeroBanner';
import { OffersCarousel } from '@/components/home/OffersCarousel';
import { CategoryCard } from '@/components/home/CategoryCard';
import { QuickCategories } from '@/components/home/QuickCategories';
import { ExclusiveOffers } from '@/components/home/ExclusiveOffers';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

// Fetch restaurants (sub_categories)
const fetchRestaurants = async () => {
  const { data, error } = await supabase
    .from('sub_categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data;
};

// Fetch offers
const fetchOffers = async () => {
  const { data, error } = await supabase
    .from('offers')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

const Index = () => {
  const addItem = useCartStore((state) => state.addItem);

  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['restaurants'],
    queryFn: fetchRestaurants,
  });

  const { data: offers, isLoading: loadingOffers } = useQuery({
    queryKey: ['offers'],
    queryFn: fetchOffers,
  });

  const handleOrderOffer = (offer: { id: string; title: string; description?: string; image?: string; price?: number }) => {
    if (!offer.price || offer.price <= 0) {
      toast.error('هذا العرض غير متاح للطلب المباشر');
      return;
    }

    addItem({
      productId: `offer-${offer.id}`,
      name: `عرض: ${offer.title}`,
      price: offer.price,
      image: offer.image,
      quantity: 1,
    });

    toast.success('تمت إضافة العرض للسلة');
  };

  return (
    <AppLayout showSearch={false}>
      {/* Hero Banner */}
      <HeroBanner />

      {/* Quick Categories */}
      <QuickCategories />

      {/* Exclusive Offers */}
      <ExclusiveOffers />

      {/* Offers Carousel */}
      {!loadingOffers && offers && offers.length > 0 && (
        <OffersCarousel
          offers={offers.map((o) => ({
            id: o.id,
            title: o.title,
            description: o.description || undefined,
            image: o.image_url || undefined,
            discount: o.discount_percentage || undefined,
            price: (o as any).price || undefined,
            originalPrice: (o as any).original_price || undefined,
          }))}
          onOrderOffer={(offerId) => {
            const offer = offers.find((o) => o.id === offerId);
            if (offer) {
              handleOrderOffer({
                id: offer.id,
                title: offer.title,
                description: offer.description || undefined,
                image: offer.image_url || undefined,
                price: (offer as any).price || undefined,
              });
            }
          }}
        />
      )}

      {/* Restaurants Section */}
      <section className="py-6 px-4">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xl font-bold mb-4"
          >
            المطاعم المتاحة
          </motion.h2>

          {loadingRestaurants ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-card rounded-2xl overflow-hidden">
                  <Skeleton className="aspect-[16/10]" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((restaurant, index) => (
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
              <div className="text-6xl mb-4">🍽️</div>
              <h3 className="text-xl font-bold mb-2">لا توجد مطاعم حالياً</h3>
              <p className="text-muted-foreground">
                سيتم إضافة المطاعم قريباً
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* WhatsApp Support */}
      <motion.a
        href="https://wa.me/201278006248"
        target="_blank"
        rel="noopener noreferrer"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-20 left-4 z-40 w-14 h-14 rounded-full bg-success flex items-center justify-center shadow-elevated"
      >
        <svg className="w-7 h-7 text-success-foreground" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </motion.a>
    </AppLayout>
  );
};

export default Index;