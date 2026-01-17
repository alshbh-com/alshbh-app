import { motion } from 'framer-motion';
import { ArrowRight, Package, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserStore } from '@/stores/userStore';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: 'قيد الانتظار', icon: <Clock className="w-4 h-4" />, color: 'text-warning' },
  confirmed: { label: 'تم التأكيد', icon: <CheckCircle className="w-4 h-4" />, color: 'text-primary' },
  preparing: { label: 'جاري التحضير', icon: <Package className="w-4 h-4" />, color: 'text-accent' },
  delivered: { label: 'تم التوصيل', icon: <CheckCircle className="w-4 h-4" />, color: 'text-success' },
  cancelled: { label: 'ملغي', icon: <XCircle className="w-4 h-4" />, color: 'text-destructive' },
};

const Orders = () => {
  const navigate = useNavigate();
  const { phone } = useUserStore();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', phone],
    queryFn: async () => {
      if (!phone) return [];
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', phone)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!phone,
  });

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">طلباتي</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4">
        {!phone ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📱</div>
            <h2 className="text-xl font-bold mb-2">لا توجد بيانات</h2>
            <p className="text-muted-foreground mb-4">
              قم بإتمام طلب أولاً لتتمكن من رؤية طلباتك
            </p>
            <Button onClick={() => navigate('/')}>تصفح المطاعم</Button>
          </motion.div>
        ) : isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card rounded-2xl p-4">
                <Skeleton className="h-6 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order, index) => {
              const status = statusConfig[order.status || 'pending'];
              const items = order.items as { name: string; quantity: number; price: number }[];
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-4 shadow-soft"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className={`flex items-center gap-1 text-sm ${status.color}`}>
                        {status.icon}
                        {status.label}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {order.created_at && format(new Date(order.created_at), 'dd MMM yyyy - HH:mm', { locale: ar })}
                    </span>
                  </div>

                  <div className="space-y-1 mb-3">
                    {items?.slice(0, 3).map((item, i) => (
                      <p key={i} className="text-sm text-muted-foreground">
                        {item.name} × {item.quantity}
                      </p>
                    ))}
                    {items?.length > 3 && (
                      <p className="text-sm text-muted-foreground">
                        +{items.length - 3} أصناف أخرى
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t">
                    <span className="text-sm text-muted-foreground">الإجمالي</span>
                    <span className="font-bold text-primary">{order.total_amount} ج.م</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-xl font-bold mb-2">لا توجد طلبات</h2>
            <p className="text-muted-foreground mb-4">لم تقم بأي طلبات بعد</p>
            <Button onClick={() => navigate('/')}>ابدأ الطلب الآن</Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Orders;
