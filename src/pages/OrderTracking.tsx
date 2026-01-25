import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Package, 
  ChefHat, 
  Truck, 
  Home,
  ArrowRight,
  RefreshCw,
  MessageCircle,
  Navigation
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import CustomerLocationMap from '@/components/maps/CustomerLocationMap';

interface Order {
  id: string;
  order_number: number;
  status: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  customer_location: string | null;
  customer_latitude: number | null;
  customer_longitude: number | null;
  total_amount: number;
  delivery_fee: number;
  platform_fee: number | null;
  created_at: string;
  district_name: string | null;
  village_name: string | null;
  items: any;
}

const orderStatuses = [
  { id: 'pending', label: 'في الانتظار', icon: Clock, description: 'تم استلام طلبك' },
  { id: 'confirmed', label: 'تم التأكيد', icon: CheckCircle2, description: 'المطعم يجهز طلبك' },
  { id: 'preparing', label: 'قيد التحضير', icon: ChefHat, description: 'الطعام قيد الإعداد' },
  { id: 'ready', label: 'جاهز للتوصيل', icon: Package, description: 'طلبك جاهز للتوصيل' },
  { id: 'on_the_way', label: 'في الطريق', icon: Truck, description: 'المندوب في طريقه إليك' },
  { id: 'delivered', label: 'تم التوصيل', icon: Home, description: 'تم تسليم طلبك بنجاح' },
];

const OrderTracking = () => {
  const { orderNumber } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchOrderNumber, setSearchOrderNumber] = useState(orderNumber || '');

  const fetchOrder = async (num: string) => {
    if (!num || num.trim() === '') return;
    
    setLoading(true);
    const searchNum = num.trim();
    
    try {
      // Try searching by order_number as integer first
      let { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', parseInt(searchNum))
        .maybeSingle();

      // If not found and parseInt failed, try as text comparison
      if (!data && isNaN(parseInt(searchNum))) {
        const result = await supabase
          .from('orders')
          .select('*')
          .ilike('order_number', searchNum)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      
      if (!data) {
        console.log('No order found for number:', searchNum);
        toast({
          title: 'لم يتم العثور على الطلب',
          description: `لا يوجد طلب برقم ${searchNum}`,
          variant: 'destructive',
        });
        setOrder(null);
      } else {
        console.log('Order found:', data);
        setOrder(data);
      }
    } catch (error) {
      console.error('Error fetching order:', error);
      toast({
        title: 'خطأ',
        description: 'حدث خطأ في البحث عن الطلب',
        variant: 'destructive',
      });
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      fetchOrder(orderNumber);
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  // Real-time subscription for order updates
  useEffect(() => {
    if (!order?.id) return;

    const channel = supabase
      .channel(`order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
          filter: `id=eq.${order.id}`,
        },
        (payload) => {
          setOrder(payload.new as Order);
          toast({
            title: 'تحديث الطلب',
            description: `تم تحديث حالة طلبك إلى: ${getStatusLabel(payload.new.status)}`,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order?.id]);

  const getStatusLabel = (status: string) => {
    return orderStatuses.find(s => s.id === status)?.label || status;
  };

  const getCurrentStatusIndex = () => {
    if (!order) return -1;
    return orderStatuses.findIndex(s => s.id === order.status);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchOrderNumber) {
      navigate(`/track-order/${searchOrderNumber}`);
      fetchOrder(searchOrderNumber);
    }
  };

  const getEstimatedTime = () => {
    const currentIndex = getCurrentStatusIndex();
    if (currentIndex === -1 || currentIndex >= orderStatuses.length - 1) return null;
    
    const remainingSteps = orderStatuses.length - 1 - currentIndex;
    return remainingSteps * 10; // 10 minutes per step estimate
  };

  return (
    <AppLayout>
      <div className="p-4 space-y-6 pb-24">
        {/* Search Form */}
        <Card className="border-2 border-dashed border-primary/30">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input
                type="number"
                placeholder="أدخل رقم الطلب..."
                value={searchOrderNumber}
                onChange={(e) => setSearchOrderNumber(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-input bg-background text-right"
              />
              <Button type="submit" className="rounded-xl">
                بحث
              </Button>
            </form>
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : order ? (
          <>
            {/* Order Header */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-l from-primary to-accent p-4 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    طلب #{order.order_number}
                  </Badge>
                  <div className="text-sm opacity-90">
                    {new Date(order.created_at || '').toLocaleDateString('ar-EG', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
                <div className="mt-3">
                  <h2 className="text-xl font-bold">{order.customer_name}</h2>
                  <p className="text-sm opacity-90">{order.customer_city}</p>
                </div>
              </div>
              
              {/* Estimated Time */}
              {getEstimatedTime() && (
                <div className="p-4 bg-success/10 border-b flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">الوقت المتوقع للتوصيل</p>
                    <p className="font-bold text-success">{getEstimatedTime()} دقيقة</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Interactive Map or Placeholder */}
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  موقع التوصيل
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                {order.customer_latitude && order.customer_longitude ? (
                  <CustomerLocationMap
                    latitude={order.customer_latitude}
                    longitude={order.customer_longitude}
                    customerName={order.customer_name}
                    customerLocation={order.customer_location || undefined}
                  />
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl">
                    {/* Animated Map Background */}
                    <div className="absolute inset-0 overflow-hidden rounded-xl">
                      <motion.div
                        className="absolute w-full h-full"
                        style={{
                          background: `
                            linear-gradient(90deg, transparent 49%, hsl(var(--muted)) 49%, hsl(var(--muted)) 51%, transparent 51%),
                            linear-gradient(transparent 49%, hsl(var(--muted)) 49%, hsl(var(--muted)) 51%, transparent 51%)
                          `,
                          backgroundSize: '50px 50px',
                        }}
                      />
                    </div>
                    
                    {/* Delivery Animation */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="relative">
                        {/* Destination Pin */}
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-16 left-1/2 -translate-x-1/2"
                        >
                          <div className="relative">
                            <MapPin className="w-10 h-10 text-destructive fill-destructive/20" />
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-destructive/30 rounded-full animate-ping" />
                          </div>
                        </motion.div>
                        
                        {/* Delivery Truck */}
                        {order.status === 'on_the_way' && (
                          <motion.div
                            animate={{ x: [0, 10, 0, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="absolute -top-8 -left-20"
                          >
                            <div className="bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                              <Truck className="w-6 h-6" />
                            </div>
                          </motion.div>
                        )}
                        
                        {/* Location Text */}
                        <div className="bg-card/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border mt-4">
                          <p className="text-sm font-medium text-center">
                            {order.village_name || order.district_name || order.customer_city}
                          </p>
                          {order.customer_location && (
                            <p className="text-xs text-muted-foreground text-center mt-1">
                              {order.customer_location}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            لم يتم تحديد الموقع بالضبط
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Status Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">حالة الطلب</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {orderStatuses.map((status, index) => {
                    const currentIndex = getCurrentStatusIndex();
                    const isCompleted = index <= currentIndex;
                    const isCurrent = index === currentIndex;
                    const Icon = status.icon;

                    return (
                      <motion.div
                        key={status.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative flex gap-4 pb-6 last:pb-0"
                      >
                        {/* Timeline Line */}
                        {index < orderStatuses.length - 1 && (
                          <div
                            className={cn(
                              'absolute right-5 top-10 w-0.5 h-full -translate-x-1/2',
                              isCompleted && index < currentIndex ? 'bg-primary' : 'bg-muted'
                            )}
                          />
                        )}

                        {/* Icon */}
                        <div
                          className={cn(
                            'relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                            isCompleted
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground',
                            isCurrent && 'ring-4 ring-primary/30 animate-pulse'
                          )}
                        >
                          <Icon className="w-5 h-5" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1">
                          <h4
                            className={cn(
                              'font-semibold',
                              isCompleted ? 'text-foreground' : 'text-muted-foreground'
                            )}
                          >
                            {status.label}
                          </h4>
                          <p className="text-sm text-muted-foreground">{status.description}</p>
                          {isCurrent && (
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              className="mt-2"
                            >
                              <Badge variant="secondary" className="bg-primary/10 text-primary">
                                الحالة الحالية
                              </Badge>
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ملخص الطلب</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Array.isArray(order.items) && order.items.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size && `${item.size} • `}الكمية: {item.quantity}
                      </p>
                    </div>
                    <p className="font-bold">{item.price * item.quantity} ج.م</p>
                  </div>
                ))}
                
                <div className="pt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">رسوم التوصيل</span>
                    <span>{order.delivery_fee} ج.م</span>
                  </div>
                  {order.platform_fee && order.platform_fee > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">رسوم المنصة</span>
                      <span className="text-accent">{order.platform_fee} ج.م</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>الإجمالي</span>
                    <span className="text-primary">{order.total_amount} ج.م</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="bg-gradient-to-l from-success/10 to-transparent border-success/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-success" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">هل تحتاج مساعدة؟</h3>
                    <p className="text-sm text-muted-foreground">تواصل معنا عبر واتساب</p>
                  </div>
                  <Button
                    variant="outline"
                    className="border-success text-success hover:bg-success/10"
                    onClick={() => window.open('https://wa.me/201278006248', '_blank')}
                  >
                    <Phone className="w-4 h-4 ml-2" />
                    اتصل
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">تتبع طلبك</h3>
              <p className="text-muted-foreground mb-4">
                أدخل رقم الطلب في الأعلى لمتابعة حالة طلبك
              </p>
              <Button variant="outline" onClick={() => navigate('/orders')}>
                عرض طلباتي
                <ArrowRight className="w-4 h-4 mr-2" />
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
};

export default OrderTracking;
