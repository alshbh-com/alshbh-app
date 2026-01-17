import { motion } from 'framer-motion';
import { Home, Utensils, ShoppingBag, User, Heart } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useCartStore } from '@/stores/cartStore';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: Home, label: 'الرئيسية', path: '/' },
  { icon: Utensils, label: 'المطاعم', path: '/restaurants' },
  { icon: ShoppingBag, label: 'السلة', path: '/cart', showBadge: true },
  { icon: Heart, label: 'المفضلة', path: '/favorites' },
  { icon: User, label: 'حسابي', path: '/profile' },
];

export const BottomNav = () => {
  const location = useLocation();
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass border-t safe-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;

          return (
            <Link
              key={item.path}
              to={item.path}
              className="relative flex flex-col items-center justify-center flex-1 h-full"
            >
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  'flex flex-col items-center gap-0.5 transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className="relative">
                  <Icon className="w-5 h-5" />
                  {item.showBadge && itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center"
                    >
                      {itemCount > 9 ? '9+' : itemCount}
                    </motion.span>
                  )}
                </div>
                <span className="text-[10px] font-medium">{item.label}</span>
              </motion.div>
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};