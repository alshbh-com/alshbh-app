import { motion } from 'framer-motion';
import { ChevronLeft, Percent, ShoppingBag } from 'lucide-react';
import { useRef } from 'react';
import { Button } from '@/components/ui/button';

interface Offer {
  id: string;
  title: string;
  description?: string;
  image?: string;
  discount?: number;
}

interface OffersCarouselProps {
  offers: Offer[];
  onOrderOffer?: (offerId: string) => void;
}

export const OffersCarousel = ({ offers, onOrderOffer }: OffersCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!offers.length) return null;

  return (
    <section className="py-6">
      <div className="container">
        <div className="flex items-center justify-between mb-4 px-4">
          <h2 className="text-xl font-bold">العروض الحالية</h2>
          <button className="flex items-center gap-1 text-primary text-sm font-medium">
            عرض الكل
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide px-4 snap-x snap-mandatory"
        >
          {offers.map((offer, index) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              className="flex-shrink-0 w-72 snap-start"
            >
              <div className="relative rounded-2xl overflow-hidden bg-gradient-to-bl from-primary to-accent h-40">
                {offer.image && (
                  <img
                    src={offer.image}
                    alt={offer.title}
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                )}
                <div className="relative z-10 p-4 h-full flex flex-col justify-between text-primary-foreground">
                  <div>
                    <h3 className="font-bold text-lg">{offer.title}</h3>
                    {offer.description && (
                      <p className="text-sm opacity-90 mt-1 line-clamp-2">{offer.description}</p>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    {offer.discount && (
                      <div className="flex items-center gap-1">
                        <Percent className="w-4 h-4" />
                        <span className="font-bold">خصم {offer.discount}%</span>
                      </div>
                    )}
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0 gap-1"
                      onClick={() => onOrderOffer?.(offer.id)}
                    >
                      <ShoppingBag className="w-4 h-4" />
                      اطلب العرض
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};