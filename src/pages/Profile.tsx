import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { User, Phone, MapPin, FileText, Shield, ChevronLeft, Settings, Edit, TrendingUp, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

const menuItems = [
  { icon: FileText, label: 'طلباتي', path: '/orders', description: 'تتبع طلباتك السابقة' },
  { icon: TrendingUp, label: 'إحصائياتي', path: '/my-stats', description: 'عرض إحصائيات طلباتك' },
  { icon: MapPin, label: 'عناويني', path: '/addresses', description: 'إدارة عناوين التوصيل' },
  { icon: Settings, label: 'الإعدادات', path: '/settings', description: 'تخصيص التطبيق' },
  { icon: Shield, label: 'سياسة الخصوصية', path: '/privacy', description: 'معلومات الخصوصية' },
];

const Profile = () => {
  const { name, phone } = useUserStore();

  // Fetch loyalty points
  const { data: loyaltyData } = useQuery({
    queryKey: ['loyalty-points', phone],
    queryFn: async () => {
      if (!phone) return { points: 0, level: 'مبتدئ' };
      
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('customer_phone', phone);

      const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const points = Math.floor(totalSpent / 10);
      
      const level = points >= 500 ? 'ذهبي' :
                   points >= 200 ? 'فضي' :
                   points >= 50 ? 'برونزي' : 'مبتدئ';

      return { points, level };
    },
    enabled: !!phone,
  });

  return (
    <AppLayout>
      <div className="container py-6 px-4">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-bl from-primary to-accent rounded-2xl p-6 text-primary-foreground mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <User className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">
                {name || 'مرحباً بك'}
              </h1>
              {phone && (
                <p className="opacity-90 flex items-center gap-1 mt-1">
                  <Phone className="w-4 h-4" />
                  {phone}
                </p>
              )}
            </div>
            <Link to="/edit-profile">
              <Button size="icon" variant="ghost" className="bg-white/20 hover:bg-white/30">
                <Edit className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Loyalty Badge */}
          {phone && loyaltyData && (
            <div className="mt-4 pt-4 border-t border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5" />
                <span className="font-medium">مستوى {loyaltyData.level}</span>
              </div>
              <span className="text-sm opacity-90">{loyaltyData.points} نقطة</span>
            </div>
          )}
        </motion.div>

        {/* Quick Actions */}
        {!phone && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-6"
          >
            <Link to="/edit-profile">
              <Button className="w-full gap-2">
                <Edit className="w-4 h-4" />
                أضف بياناتك لتفعيل المميزات
              </Button>
            </Link>
          </motion.div>
        )}

        {/* Menu Items */}
        <div className="space-y-3">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.path}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Link
                to={item.path}
                className="flex items-center gap-4 bg-card rounded-xl p-4 shadow-soft card-hover"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{item.label}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronLeft className="w-5 h-5 text-muted-foreground" />
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8"
        >
          <h2 className="text-lg font-bold mb-4">تحتاج مساعدة؟</h2>
          <a
            href="https://wa.me/201278006248"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 bg-success/10 rounded-xl p-4 border border-success/20"
          >
            <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center">
              <svg className="w-5 h-5 text-success-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-success">تواصل معنا على واتساب</h3>
              <p className="text-sm text-muted-foreground">+20 127 800 6248</p>
            </div>
            <ChevronLeft className="w-5 h-5 text-muted-foreground" />
          </a>
        </motion.div>

        {/* Version */}
        <p className="text-center text-sm text-muted-foreground mt-8">
          الشبح - الإصدار 1.0.0
        </p>
      </div>
    </AppLayout>
  );
};

export default Profile;