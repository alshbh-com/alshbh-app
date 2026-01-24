import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home,
  Store,
  Heart,
  ShoppingBag,
  MapPin,
  Settings,
  Shield,
  Phone,
  User,
  ClipboardList,
  Lock,
  HelpCircle,
  Info,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';

interface SideDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const menuItems = [
  { title: 'الرئيسية', href: '/home', icon: Home },
  { title: 'المطاعم', href: '/restaurants', icon: Store },
  { title: 'المفضلة', href: '/favorites', icon: Heart },
  { title: 'سلة التسوق', href: '/cart', icon: ShoppingBag },
  { title: 'طلباتي', href: '/orders', icon: ClipboardList },
  { title: 'تتبع الطلب', href: '/track-order', icon: Navigation },
  { title: 'عناويني', href: '/addresses', icon: MapPin },
  { title: 'الملف الشخصي', href: '/profile', icon: User },
];

const settingsItems = [
  { title: 'الإعدادات', href: '/settings', icon: Settings },
  { title: 'من نحن', href: '/about', icon: Info },
  { title: 'الأسئلة الشائعة', href: '/faq', icon: HelpCircle },
  { title: 'سياسة الخصوصية', href: '/privacy', icon: Shield },
  { title: 'لوحة التحكم', href: '/admin', icon: Lock },
];

export const SideDrawer = ({ open, onOpenChange }: SideDrawerProps) => {
  const location = useLocation();

  const isActive = (href: string) => location.pathname === href;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80 p-0">
        <SheetHeader className="p-6 bg-gradient-to-bl from-primary to-accent text-primary-foreground">
          <div className="flex items-center gap-3">
            <Logo size="md" showText={false} />
            <div>
              <SheetTitle className="text-xl font-bold text-primary-foreground">
                الشبح فود
              </SheetTitle>
              <p className="text-sm opacity-90">منصة طلب الطعام</p>
            </div>
          </div>
        </SheetHeader>

        <div className="py-4">
          {/* Main Menu */}
          <div className="px-4 mb-2">
            <span className="text-xs font-medium text-muted-foreground">القائمة الرئيسية</span>
          </div>
          <nav className="space-y-1 px-2">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Settings Section */}
          <div className="px-4 mt-6 mb-2">
            <span className="text-xs font-medium text-muted-foreground">الإعدادات</span>
          </div>
          <nav className="space-y-1 px-2">
            {settingsItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.href}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (menuItems.length + index) * 0.05 }}
                >
                  <Link
                    to={item.href}
                    onClick={() => onOpenChange(false)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'hover:bg-muted'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.title}</span>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Contact */}
          <div className="mt-6 mx-4 p-4 rounded-xl bg-muted">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <Phone className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium">تواصل معنا</p>
                <a
                  href="https://wa.me/201278006248"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary"
                >
                  01278006248
                </a>
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
