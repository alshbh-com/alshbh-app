import { motion } from 'framer-motion';
import { ShoppingBag, Menu, Search, MapPin } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { useEffect, useState } from 'react';

interface AppHeaderProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
}

interface SavedLocation {
  district: { id: string; name: string };
  village: { id: string; name: string };
}

export const AppHeader = ({ onMenuClick, showSearch = true }: AppHeaderProps) => {
  const itemCount = useCartStore((state) => state.getItemCount());
  const navigate = useNavigate();
  const [location, setLocation] = useState<SavedLocation | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('alshbh_selected_location');
    if (saved) {
      try {
        setLocation(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing location:', e);
      }
    }
  }, []);

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

        {/* Logo + Location */}
        <div className="flex items-center gap-3">
          <Link to="/home" className="flex items-center">
            <Logo size="md" showText={true} />
          </Link>
          
          {/* Village Name Badge */}
          {location?.village && (
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <MapPin className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium text-primary truncate max-w-[80px]">
                {location.village.name}
              </span>
            </button>
          )}
        </div>

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
