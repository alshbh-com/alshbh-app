import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Store,
  Package,
  ClipboardList,
  DollarSign,
  TrendingUp,
  LogOut,
  Bell,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'restaurants' | 'products' | 'orders'>('dashboard');

  // Check authentication
  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

    if (!isAuth || !authTime || Date.now() - parseInt(authTime) > SESSION_DURATION) {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_auth_time');
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
    toast.success('تم تسجيل الخروج');
    navigate('/admin');
  };

  // Fetch stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [ordersRes, restaurantsRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact' }),
        supabase.from('sub_categories').select('*', { count: 'exact' }).eq('is_active', true),
        supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true),
      ]);

      const orders = ordersRes.data || [];
      const todayOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at || '');
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      });

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        totalOrders: ordersRes.count || 0,
        todayOrders: todayOrders.length,
        totalRestaurants: restaurantsRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalRevenue,
        todayRevenue,
      };
    },
  });

  // Fetch recent orders
  const { data: recentOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-recent-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Fetch restaurants
  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const statCards = [
    { title: 'الطلبات اليوم', value: stats?.todayOrders || 0, icon: ClipboardList, color: 'bg-primary' },
    { title: 'إيرادات اليوم', value: `${stats?.todayRevenue || 0} ج.م`, icon: DollarSign, color: 'bg-success' },
    { title: 'إجمالي الطلبات', value: stats?.totalOrders || 0, icon: TrendingUp, color: 'bg-accent' },
    { title: 'المطاعم النشطة', value: stats?.totalRestaurants || 0, icon: Store, color: 'bg-warning' },
  ];

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'restaurants', label: 'المطاعم', icon: Store },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'orders', label: 'الطلبات', icon: ClipboardList },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">ش</span>
            </div>
            <div>
              <h1 className="font-bold">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">الشبح</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container p-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className="whitespace-nowrap"
              >
                <Icon className="w-4 h-4 ml-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {loadingStats
                ? [...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))
                : statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-2xl p-4 shadow-soft"
                      >
                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                      </motion.div>
                    );
                  })}
            </div>

            {/* Recent Orders */}
            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <h2 className="font-bold mb-4">آخر الطلبات</h2>
              {loadingOrders ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-xl"
                    >
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary">{order.total_amount} ج.م</p>
                        <p className="text-xs text-muted-foreground">
                          {order.status === 'pending' && 'قيد الانتظار'}
                          {order.status === 'confirmed' && 'تم التأكيد'}
                          {order.status === 'delivered' && 'تم التوصيل'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
              )}
            </div>
          </>
        )}

        {activeTab === 'restaurants' && (
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <h2 className="font-bold mb-4">المطاعم</h2>
            {loadingRestaurants ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : restaurants && restaurants.length > 0 ? (
              <div className="space-y-3">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center gap-4 p-3 bg-muted rounded-xl"
                  >
                    <img
                      src={restaurant.image_url || '/placeholder.svg'}
                      alt={restaurant.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{restaurant.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {restaurant.is_open ? 'مفتوح' : 'مغلق'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد مطاعم</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <h2 className="font-bold mb-4">جميع الطلبات</h2>
            {loadingOrders ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : recentOrders && recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => {
                  const items = order.items as { name: string; quantity: number }[];
                  return (
                    <div
                      key={order.id}
                      className="p-4 bg-muted rounded-xl"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold">{order.customer_name}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-warning/20 text-warning' :
                          order.status === 'confirmed' ? 'bg-primary/20 text-primary' :
                          'bg-success/20 text-success'
                        }`}>
                          {order.status === 'pending' && 'قيد الانتظار'}
                          {order.status === 'confirmed' && 'تم التأكيد'}
                          {order.status === 'delivered' && 'تم التوصيل'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{order.customer_phone}</p>
                      <p className="text-sm text-muted-foreground mb-2">{order.customer_city}</p>
                      <div className="text-sm">
                        {items?.slice(0, 3).map((item, i) => (
                          <span key={i}>
                            {item.name} × {item.quantity}
                            {i < Math.min(items.length - 1, 2) && '، '}
                          </span>
                        ))}
                        {items?.length > 3 && <span> +{items.length - 3} أخرى</span>}
                      </div>
                      <p className="font-bold text-primary mt-2">{order.total_amount} ج.م</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <h2 className="font-bold mb-4">المنتجات</h2>
            <p className="text-center text-muted-foreground py-8">
              قريباً - إدارة المنتجات
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
