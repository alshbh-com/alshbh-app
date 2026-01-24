import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, DollarSign, ShoppingCart, Users } from 'lucide-react';

const COLORS = ['hsl(25, 95%, 53%)', 'hsl(142, 76%, 36%)', 'hsl(217, 91%, 60%)', 'hsl(45, 93%, 47%)'];

export const AdminAnalytics = () => {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const now = new Date();
      const last7Days = Array.from({ length: 7 }, (_, i) => {
        const date = new Date(now);
        date.setDate(date.getDate() - (6 - i));
        return date.toISOString().split('T')[0];
      });

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${last7Days[0]}T00:00:00`)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Process data for charts
      const dailyData = last7Days.map(date => {
        const dayOrders = (orders || []).filter(o => 
          o.created_at?.startsWith(date)
        );
        return {
          date: new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' }),
          orders: dayOrders.length,
          revenue: dayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0),
        };
      });

      // Status distribution
      const statusCounts = {
        pending: (orders || []).filter(o => o.status === 'pending').length,
        confirmed: (orders || []).filter(o => o.status === 'confirmed').length,
        delivered: (orders || []).filter(o => o.status === 'delivered').length,
      };

      const pieData = [
        { name: 'قيد الانتظار', value: statusCounts.pending },
        { name: 'تم التأكيد', value: statusCounts.confirmed },
        { name: 'تم التوصيل', value: statusCounts.delivered },
      ].filter(d => d.value > 0);

      // Calculate totals
      const totalRevenue = (orders || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const totalOrders = orders?.length || 0;
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      return {
        dailyData,
        pieData,
        totalRevenue,
        totalOrders,
        avgOrderValue,
      };
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  const summaryCards = [
    { title: 'إجمالي الإيرادات (7 أيام)', value: `${analyticsData?.totalRevenue || 0} ج.م`, icon: DollarSign, color: 'bg-success' },
    { title: 'إجمالي الطلبات', value: analyticsData?.totalOrders || 0, icon: ShoppingCart, color: 'bg-primary' },
    { title: 'متوسط قيمة الطلب', value: `${analyticsData?.avgOrderValue || 0} ج.م`, icon: TrendingUp, color: 'bg-accent' },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-card rounded-2xl p-4 shadow-soft"
            >
              <div className={`w-10 h-10 rounded-xl ${card.color} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className="text-sm text-muted-foreground">{card.title}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Revenue Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-4 shadow-soft"
      >
        <h3 className="font-bold mb-4">الإيرادات اليومية (آخر 7 أيام)</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={analyticsData?.dailyData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value) => [`${value} ج.م`, 'الإيرادات']}
            />
            <Area 
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(25, 95%, 53%)" 
              fill="hsl(25, 95%, 53%, 0.2)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Orders Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-card rounded-2xl p-4 shadow-soft"
      >
        <h3 className="font-bold mb-4">عدد الطلبات اليومية</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={analyticsData?.dailyData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'hsl(var(--card))', 
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
              }}
              formatter={(value) => [`${value}`, 'الطلبات']}
            />
            <Bar dataKey="orders" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Status Pie Chart */}
      {analyticsData?.pieData && analyticsData.pieData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card rounded-2xl p-4 shadow-soft"
        >
          <h3 className="font-bold mb-4">توزيع حالات الطلبات</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={analyticsData.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analyticsData.pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {analyticsData.pieData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                />
                <span className="text-sm text-muted-foreground">{entry.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
