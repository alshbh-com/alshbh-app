import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface AnnouncementBannerProps {
  globalOnly?: boolean;
}

export const AnnouncementBanner = ({ globalOnly = false }: AnnouncementBannerProps) => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: announcements } = useQuery({
    queryKey: ['announcements', globalOnly],
    queryFn: async () => {
      let query = supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      if (globalOnly) {
        query = query.eq('show_on_all_pages', true);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const visible = (announcements || []).filter((a) => !dismissed.has(a.id));

  useEffect(() => {
    if (visible.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % visible.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [visible.length]);

  if (visible.length === 0) return null;

  const current = visible[currentIndex % visible.length];
  const hasImage = !!current.image_url;

  // Premium style for announcements with images (like Express Go)
  if (hasImage) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="relative overflow-hidden"
        >
          {/* Gradient background */}
          <div className="bg-gradient-to-l from-red-600 via-red-500 to-orange-500 px-4 py-4">
            {/* Animated shimmer overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
            />
            
            {/* Decorative particles */}
            <motion.div
              className="absolute top-1 right-4"
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-4 h-4 text-yellow-300/60" />
            </motion.div>
            <motion.div
              className="absolute bottom-1 left-12"
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-3 h-3 text-yellow-300/40" />
            </motion.div>

            <div className="container flex items-center justify-center gap-4 relative z-10">
              {/* Logo with glow effect */}
              <motion.div
                className="relative flex-shrink-0"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-md" />
                <img
                  src={current.image_url}
                  alt=""
                  className="relative w-14 h-14 rounded-2xl object-cover border-2 border-white/50 shadow-lg"
                />
              </motion.div>

              {/* Text */}
              <div className="flex-1 text-center">
                <motion.p
                  className="text-white font-bold text-sm md:text-base leading-relaxed drop-shadow-md"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  {current.message}
                </motion.p>
                <motion.div
                  className="flex items-center justify-center gap-1.5 mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <span className="inline-block w-8 h-0.5 bg-yellow-300/60 rounded-full" />
                  <span className="text-yellow-200 text-xs font-medium">شريك التوصيل الرسمي</span>
                  <span className="inline-block w-8 h-0.5 bg-yellow-300/60 rounded-full" />
                </motion.div>
              </div>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => setDismissed((prev) => new Set(prev).add(current.id))}
              className="absolute left-2 top-2 p-1 rounded-full bg-black/20 hover:bg-black/40 transition-colors z-20"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          {visible.length > 1 && (
            <div className="flex justify-center gap-1 py-1 bg-red-700">
              {visible.map((_, i) => (
                <div
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full transition-colors ${
                    i === currentIndex % visible.length ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  // Standard style for text-only announcements
  const bgClass =
    current.type === 'success'
      ? 'bg-success/10 border-success/30 text-success'
      : current.type === 'warning'
        ? 'bg-warning/10 border-warning/30 text-warning-foreground'
        : 'bg-primary/10 border-primary/30 text-primary';

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={current.id}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`relative border-b px-4 py-3 ${bgClass}`}
      >
        <div className="container flex items-center justify-center gap-3 text-sm font-medium">
          <Megaphone className="w-4 h-4 flex-shrink-0" />
          <span className="text-center leading-relaxed">{current.message}</span>
          <button
            onClick={() => setDismissed((prev) => new Set(prev).add(current.id))}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {visible.length > 1 && (
          <div className="flex justify-center gap-1 mt-1.5">
            {visible.map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === currentIndex % visible.length ? 'bg-current opacity-80' : 'bg-current opacity-25'
                }`}
              />
            ))}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};