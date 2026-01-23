import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, TrendingUp, Calendar, Award } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { Skeleton } from '@/components/ui/skeleton';

const MyStats = () => {
  const navigate = useNavigate();
  const { phone } = useUserStore();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['user-stats', phone],
    queryFn: async () => {
      if (!phone) return null;
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('total_amount, delivery_fee, created_at, status')
        .eq('customer_phone', phone);

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const totalSpent = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const deliveryFees = orders?.reduce((sum, o) => sum + (o.delivery_fee || 0), 0) || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
      
      // Calculate average order value
      const avgOrderValue = totalOrders > 0 ? Math.round(totalSpent / totalOrders) : 0;
      
      // Get first order date
      const firstOrderDate = orders?.length ? 
        new Date(Math.min(...orders.map(o => new Date(o.created_at || '').getTime()))) : null;
      
      // Calculate loyalty points (1 point per 10 EGP spent)
      const loyaltyPoints = Math.floor(totalSpent / 10);

      return {
        totalOrders,
        totalSpent,
        deliveryFees,
        completedOrders,
        avgOrderValue,
        firstOrderDate,
        loyaltyPoints,
      };
    },
    enabled: !!phone,
  });

  const statCards = [
    {
      icon: ShoppingBag,
      label: 'إجمالي الطلبات',
      value: stats?.totalOrders || 0,
      suffix: 'طلب',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: TrendingUp,
      label: 'إجمالي المصروفات',
      value: stats?.totalSpent || 0,
      suffix: 'ج.م',
      color: 'bg-success/10 text-success',
    },
    {
      icon: Award,
      label: 'نقاط الولاء',
      value: stats?.loyaltyPoints || 0,
      suffix: 'نقطة',
      color: 'bg-accent/10 text-accent',
    },
    {
      icon: Calendar,
      label: 'متوسط قيمة الطلب',
      value: stats?.avgOrderValue || 0,
      suffix: 'ج.م',
      color: 'bg-warning/10 text-warning',
    },
  ];

  if (!phone) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="sticky top-0 z-50 bg-background border-b">
          <div className="container flex items-center h-16 px-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowRight className="w-5 h-5" />
            </Button>
            <h1 className="flex-1 text-center text-lg font-bold">إحصائياتي</h1>
            <div className="w-10" />
          </div>
        </header>
        <div className="container p-4">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground" />
            </div>
            <h2 className="text-lg font-bold mb-2">لا توجد بيانات</h2>
            <p className="text-muted-foreground mb-4">أضف رقم هاتفك لعرض إحصائياتك</p>
            <Button onClick={() => navigate('/edit-profile')}>
              تعديل الملف الشخصي
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">إحصائياتي</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                <stat.icon className="w-5 h-5" />
              </div>
              {isLoading ? (
                <Skeleton className="h-8 w-20 mb-1" />
              ) : (
                <p className="text-2xl font-bold">{stat.value.toLocaleString()}</p>
              )}
              <p className="text-xs text-muted-foreground">{stat.suffix}</p>
              <p className="text-sm font-medium mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Loyalty Level */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-bl from-primary to-accent rounded-2xl p-6 text-primary-foreground mb-6"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Award className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm opacity-90">مستوى الولاء</p>
              <p className="text-xl font-bold">
                {(stats?.loyaltyPoints || 0) >= 500 ? 'ذهبي' :
                 (stats?.loyaltyPoints || 0) >= 200 ? 'فضي' :
                 (stats?.loyaltyPoints || 0) >= 50 ? 'برونزي' : 'مبتدئ'}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>نقاطك الحالية</span>
              <span>{stats?.loyaltyPoints || 0} نقطة</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ 
                  width: `${Math.min(((stats?.loyaltyPoints || 0) % 200) / 200 * 100, 100)}%` 
                }}
              />
            </div>
            <p className="text-xs opacity-80 mt-2">
              {(stats?.loyaltyPoints || 0) < 50 ? `باقي ${50 - (stats?.loyaltyPoints || 0)} نقطة للمستوى البرونزي` :
               (stats?.loyaltyPoints || 0) < 200 ? `باقي ${200 - (stats?.loyaltyPoints || 0)} نقطة للمستوى الفضي` :
               (stats?.loyaltyPoints || 0) < 500 ? `باقي ${500 - (stats?.loyaltyPoints || 0)} نقطة للمستوى الذهبي` :
               'أنت في أعلى مستوى! 🎉'}
            </p>
          </div>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-card rounded-2xl p-4 shadow-soft space-y-4"
        >
          <h3 className="font-bold">معلومات إضافية</h3>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">رسوم التوصيل المدفوعة</span>
            <span className="font-medium">{stats?.deliveryFees?.toLocaleString() || 0} ج.م</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <span className="text-muted-foreground">الطلبات المكتملة</span>
            <span className="font-medium">{stats?.completedOrders || 0} طلب</span>
          </div>
          {stats?.firstOrderDate && (
            <div className="flex justify-between items-center py-2">
              <span className="text-muted-foreground">عميل منذ</span>
              <span className="font-medium">
                {stats.firstOrderDate.toLocaleDateString('ar-EG', { 
                  year: 'numeric', 
                  month: 'long' 
                })}
              </span>
            </div>
          )}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center text-sm text-muted-foreground mt-6"
        >
          تحصل على نقطة واحدة لكل 10 جنيه تنفقه
        </motion.p>
      </div>
    </div>
  );
};

export default MyStats;
