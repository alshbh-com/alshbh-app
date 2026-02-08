import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
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
          {current.image_url ? (
            <img src={current.image_url} alt="" className="w-8 h-8 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <Megaphone className="w-4 h-4 flex-shrink-0" />
          )}
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