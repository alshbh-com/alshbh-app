import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, Download, Calendar, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export const AdminReports = () => {
  const [period, setPeriod] = useState('7');

  const { data: reportData, isLoading } = useQuery({
    queryKey: ['admin-report', period],
    queryFn: async () => {
      const days = parseInt(period);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, o) => sum + (o.total_amount || 0), 0) || 0;
      const totalDeliveryFees = orders?.reduce((sum, o) => sum + (o.delivery_fee || 0), 0) || 0;
      const avgOrderValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

      // Status breakdown
      const statusBreakdown = {
        pending: orders?.filter(o => o.status === 'pending').length || 0,
        confirmed: orders?.filter(o => o.status === 'confirmed').length || 0,
        delivered: orders?.filter(o => o.status === 'delivered').length || 0,
      };

      // Top villages
      const villageOrders: Record<string, { count: number; revenue: number }> = {};
      orders?.forEach(order => {
        const village = order.village_name || order.customer_city || 'غير محدد';
        if (!villageOrders[village]) {
          villageOrders[village] = { count: 0, revenue: 0 };
        }
        villageOrders[village].count++;
        villageOrders[village].revenue += order.total_amount || 0;
      });

      const topVillages = Object.entries(villageOrders)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

      return {
        totalOrders,
        totalRevenue,
        totalDeliveryFees,
        avgOrderValue,
        statusBreakdown,
        topVillages,
        orders,
      };
    },
  });

  const generateCSV = () => {
    if (!reportData?.orders) return;

    const headers = ['رقم الطلب', 'العميل', 'الهاتف', 'المنطقة', 'المجموع', 'التوصيل', 'الحالة', 'التاريخ'];
    const rows = reportData.orders.map((order, index) => [
      index + 1,
      order.customer_name,
      order.customer_phone,
      order.village_name || order.customer_city,
      order.total_amount,
      order.delivery_fee,
      order.status === 'pending' ? 'قيد الانتظار' : order.status === 'confirmed' ? 'تم التأكيد' : 'تم التوصيل',
      new Date(order.created_at || '').toLocaleDateString('ar-EG'),
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `تقرير-الشبح-فود-${new Date().toLocaleDateString('ar-EG')}.csv`;
    link.click();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-48 rounded-xl" />
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const summaryCards = [
    { title: 'إجمالي الطلبات', value: reportData?.totalOrders || 0, icon: ShoppingCart, color: 'bg-primary' },
    { title: 'إجمالي الإيرادات', value: `${reportData?.totalRevenue || 0} ج.م`, icon: DollarSign, color: 'bg-success' },
    { title: 'رسوم التوصيل', value: `${reportData?.totalDeliveryFees || 0} ج.م`, icon: TrendingUp, color: 'bg-accent' },
    { title: 'متوسط الطلب', value: `${reportData?.avgOrderValue || 0} ج.م`, icon: TrendingUp, color: 'bg-warning' },
  ];

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary" />
          <h2 className="font-bold">التقارير</h2>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-36">
              <Calendar className="w-4 h-4 ml-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">آخر 7 أيام</SelectItem>
              <SelectItem value="30">آخر 30 يوم</SelectItem>
              <SelectItem value="90">آخر 3 شهور</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={generateCSV} variant="outline">
            <Download className="w-4 h-4 ml-2" />
            تصدير CSV
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Status Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-card rounded-2xl p-4 shadow-soft"
      >
        <h3 className="font-bold mb-4">توزيع حالات الطلبات</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 bg-warning/10 rounded-xl">
            <p className="text-2xl font-bold text-warning">{reportData?.statusBreakdown.pending}</p>
            <p className="text-sm text-muted-foreground">قيد الانتظار</p>
          </div>
          <div className="text-center p-3 bg-accent/10 rounded-xl">
            <p className="text-2xl font-bold text-accent">{reportData?.statusBreakdown.confirmed}</p>
            <p className="text-sm text-muted-foreground">تم التأكيد</p>
          </div>
          <div className="text-center p-3 bg-success/10 rounded-xl">
            <p className="text-2xl font-bold text-success">{reportData?.statusBreakdown.delivered}</p>
            <p className="text-sm text-muted-foreground">تم التوصيل</p>
          </div>
        </div>
      </motion.div>

      {/* Top Villages */}
      {reportData?.topVillages && reportData.topVillages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-2xl p-4 shadow-soft"
        >
          <h3 className="font-bold mb-4">أكثر المناطق طلباً</h3>
          <div className="space-y-3">
            {reportData.topVillages.map(([village, data], index) => (
              <div key={village} className="flex items-center justify-between p-3 bg-muted rounded-xl">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{village}</span>
                </div>
                <div className="text-left">
                  <p className="font-bold text-primary">{data.count} طلب</p>
                  <p className="text-xs text-muted-foreground">{data.revenue} ج.م</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};
