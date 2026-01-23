import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';

export const FloatingCartButton = () => {
  const itemCount = useCartStore((state) => state.getItemCount());
  const total = useCartStore((state) => state.getTotal());

  return (
    <AnimatePresence>
      {itemCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-4 right-4 z-50"
        >
          <Link to="/cart">
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="bg-primary text-primary-foreground rounded-2xl p-4 shadow-elevated flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingBag className="w-6 h-6" />
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                </div>
                <span className="font-bold">عرض السلة</span>
              </div>
              <span className="font-bold text-lg">{total} ج.م</span>
            </motion.div>
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
