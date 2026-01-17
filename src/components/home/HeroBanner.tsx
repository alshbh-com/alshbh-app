import { motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const HeroBanner = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-bl from-primary via-primary to-accent py-8 px-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 right-10 text-6xl">🍕</div>
        <div className="absolute bottom-10 left-10 text-5xl">🍔</div>
        <div className="absolute top-1/2 right-1/3 text-4xl">🍟</div>
      </div>

      <div className="container relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-primary-foreground"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-2">
            أهلاً بك في الشبه
          </h1>
          <p className="text-lg opacity-90 mb-6">
            اطلب أكلك المفضل من أفضل المطاعم في كفر شكر
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن مطعم أو وجبة..."
                className="w-full h-12 pr-12 pl-4 rounded-xl bg-background text-foreground border-0 focus:ring-2 focus:ring-background/50 shadow-elevated"
              />
            </div>
          </div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-center gap-2 mt-4"
          >
            <MapPin className="w-4 h-4" />
            <span className="text-sm opacity-90">التوصيل إلى: كفر شكر والمناطق المجاورة</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
};