import { motion } from 'framer-motion';
import { ShoppingBag, Menu, Search } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AppHeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
}

export const AppHeader = ({ onMenuClick, showSearch = true }: AppHeaderProps) => {
  const itemCount = useCartStore((state) => state.getItemCount());

  return (
    <header className="sticky top-0 z-50 glass border-b safe-top">
      <div className="container flex items-center justify-between h-16 px-4">
        {/* Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="w-5 h-5" />
        </Button>

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"
          >
            <span className="text-xl font-bold text-primary-foreground">ش</span>
          </motion.div>
          <span className="text-xl font-bold text-gradient hidden sm:block">الشبه</span>
        </Link>

        {/* Search - Desktop */}
        {showSearch && (
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="ابحث عن مطعم أو وجبة..."
                className="w-full h-11 pr-10 pl-4 rounded-xl bg-secondary border-0 focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
          </div>
        )}

        {/* Cart Button */}
        <Link to="/cart">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
          >
            <ShoppingBag className="w-5 h-5" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -left-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center"
              >
                {itemCount > 99 ? '99+' : itemCount}
              </motion.span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
};