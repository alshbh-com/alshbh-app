import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Trash2, Pencil, Save, MapPin, Phone, Search, X } from 'lucide-react';

interface OrderEditForm {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_city: string;
  village_name: string;
  district_name: string;
  status: string;
  total_amount: number;
  delivery_fee: number;
}

export const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editModal, setEditModal] = useState(false);
  const [editForm, setEditForm] = useState<OrderEditForm | null>(null);

  const { data: allOrders, isLoading } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (form: OrderEditForm) => {
      const { error } = await supabase
        .from('orders')
        .update({
          customer_name: form.customer_name,
          customer_phone: form.customer_phone,
          customer_city: form.customer_city,
          village_name: form.village_name,
          district_name: form.district_name,
          status: form.status,
          total_amount: form.total_amount,
          delivery_fee: form.delivery_fee,
        })
        .eq('id', form.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setEditModal(false);
      toast.success('تم تحديث الطلب');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('orders').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('تم حذف الطلب');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      toast.success('تم تحديث حالة الطلب');
    },
  });

  const openEdit = (order: any) => {
    setEditForm({
      id: order.id,
      customer_name: order.customer_name,
      customer_phone: order.customer_phone,
      customer_city: order.customer_city,
      village_name: order.village_name || '',
      district_name: order.district_name || '',
      status: order.status || 'pending',
      total_amount: order.total_amount,
      delivery_fee: order.delivery_fee,
    });
    setEditModal(true);
  };

  const filteredOrders = allOrders?.filter((order) => {
    const matchSearch = !searchTerm ||
      order.customer_name.includes(searchTerm) ||
      order.customer_phone.includes(searchTerm) ||
      String(order.order_number).includes(searchTerm);
    const matchStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const statusLabel = (status: string) => {
    switch (status) {
      case 'confirmed': return 'تم التأكيد';
      case 'delivered': return 'تم التوصيل';
      case 'cancelled': return 'ملغي';
      default: return 'قيد الانتظار';
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-accent/20 text-accent-foreground';
      case 'delivered': return 'bg-success/20 text-success';
      case 'cancelled': return 'bg-destructive/20 text-destructive';
      default: return 'bg-warning/20 text-warning';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <h2 className="font-bold mb-4">جميع الطلبات ({allOrders?.length || 0})</h2>

      {/* Filters */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالاسم أو الهاتف أو رقم الطلب..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute left-3 top-1/2 -translate-y-1/2">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="pending">قيد الانتظار</SelectItem>
            <SelectItem value="confirmed">تم التأكيد</SelectItem>
            <SelectItem value="delivered">تم التوصيل</SelectItem>
            <SelectItem value="cancelled">ملغي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      ) : filteredOrders && filteredOrders.length > 0 ? (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const items = order.items as { name: string; quantity: number; size?: string }[];
            return (
              <div key={order.id} className="p-4 bg-muted rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-bold">
                    <span className="text-primary text-lg">#{order.order_number}</span>
                    <span className="mx-2">-</span>
                    {order.customer_name}
                  </p>
                  <div className="flex items-center gap-2">
                    <Select
                      value={order.status || 'pending'}
                      onValueChange={(status) => updateStatusMutation.mutate({ id: order.id, status })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">قيد الانتظار</SelectItem>
                        <SelectItem value="confirmed">تم التأكيد</SelectItem>
                        <SelectItem value="delivered">تم التوصيل</SelectItem>
                        <SelectItem value="cancelled">ملغي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {order.customer_phone}
                </p>
                <p className="text-sm text-muted-foreground mb-2 flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {order.village_name || order.customer_city}
                  {order.district_name && ` - ${order.district_name}`}
                </p>
                <div className="text-sm mb-2">
                  {items?.map((item, i) => (
                    <span key={i}>
                      {item.name} {item.size && `(${item.size})`} × {item.quantity}
                      {i < items.length - 1 && '، '}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-primary">{order.total_amount} ج.م</p>
                    <p className="text-xs text-muted-foreground">توصيل: {order.delivery_fee} ج.م</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.created_at || '').toLocaleString('ar-EG')}
                    </p>
                    <Button variant="ghost" size="icon" onClick={() => openEdit(order)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => {
                        if (confirm('هل تريد حذف هذا الطلب نهائياً؟')) {
                          deleteMutation.mutate(order.id);
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
      )}

      {/* Edit Order Modal */}
      <Dialog open={editModal} onOpenChange={setEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>تعديل الطلب</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <Input
                placeholder="اسم العميل"
                value={editForm.customer_name}
                onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
              />
              <Input
                placeholder="رقم الهاتف"
                value={editForm.customer_phone}
                onChange={(e) => setEditForm({ ...editForm, customer_phone: e.target.value })}
              />
              <Input
                placeholder="المدينة"
                value={editForm.customer_city}
                onChange={(e) => setEditForm({ ...editForm, customer_city: e.target.value })}
              />
              <Input
                placeholder="القرية"
                value={editForm.village_name}
                onChange={(e) => setEditForm({ ...editForm, village_name: e.target.value })}
              />
              <Input
                placeholder="المركز"
                value={editForm.district_name}
                onChange={(e) => setEditForm({ ...editForm, district_name: e.target.value })}
              />
              <Select
                value={editForm.status}
                onValueChange={(v) => setEditForm({ ...editForm, status: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">قيد الانتظار</SelectItem>
                  <SelectItem value="confirmed">تم التأكيد</SelectItem>
                  <SelectItem value="delivered">تم التوصيل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="الإجمالي"
                  value={editForm.total_amount}
                  onChange={(e) => setEditForm({ ...editForm, total_amount: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="رسوم التوصيل"
                  value={editForm.delivery_fee}
                  onChange={(e) => setEditForm({ ...editForm, delivery_fee: Number(e.target.value) })}
                />
              </div>
              <Button
                className="w-full"
                onClick={() => editForm && updateMutation.mutate(editForm)}
                disabled={updateMutation.isPending}
              >
                <Save className="w-4 h-4 ml-2" />
                {updateMutation.isPending ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
