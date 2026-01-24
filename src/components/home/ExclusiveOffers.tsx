import { motion } from 'framer-motion';
import { Sparkles, Percent } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

export const ExclusiveOffers = () => {
  const addItem = useCartStore((state) => state.addItem);

  const { data: offers, isLoading } = useQuery({
    queryKey: ['exclusive-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const handleOrder = (offer: typeof offers[number]) => {
    if (!(offer as any).price || (offer as any).price <= 0) {
      toast.error('هذا العرض غير متاح للطلب المباشر');
      return;
    }

    addItem({
      productId: `offer-${offer.id}`,
      name: `عرض: ${offer.title}`,
      price: (offer as any).price,
      image: offer.image_url || undefined,
      quantity: 1,
    });
    toast.success('تمت إضافة العرض للسلة');
  };

  if (isLoading) {
    return (
      <section className="py-4 px-4">
        <div className="container">
          <div className="flex items-center gap-2 mb-4">
            <Skeleton className="w-6 h-6 rounded" />
            <Skeleton className="w-32 h-6" />
          </div>
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </section>
    );
  }

  if (!offers || offers.length === 0) return null;

  return (
    <section className="py-4 px-4">
      <div className="container">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="text-lg font-bold">عروض حصرية</h2>
        </div>
        <div className="space-y-4">
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="relative bg-gradient-to-br from-accent to-primary rounded-2xl overflow-hidden shadow-elevated"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
              
              <div className="relative flex items-center gap-4 p-4">
                {offer.image_url && (
                  <img
                    src={offer.image_url}
                    alt={offer.title}
                    className="w-24 h-24 rounded-xl object-cover"
                  />
                )}
                <div className="flex-1 text-primary-foreground">
                  <div className="flex items-center gap-2 mb-1">
                    {offer.discount_percentage && (
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Percent className="w-3 h-3" />
                        {offer.discount_percentage}%
                      </span>
                    )}
                  </div>
                  <h3 className="font-bold text-lg">{offer.title}</h3>
                  {offer.description && (
                    <p className="text-sm opacity-90 line-clamp-2">{offer.description}</p>
                  )}
                  <Button
                    size="sm"
                    variant="secondary"
                    className="mt-2"
                    onClick={() => handleOrder(offer)}
                  >
                    اطلب الآن
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
