import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Send, Bell, Users, Clock } from 'lucide-react';

interface NotificationForm {
  title: string;
  message: string;
  image_url: string;
  target_audience: string;
}

export const AdminNotifications = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<NotificationForm>({
    title: '',
    message: '',
    image_url: '',
    target_audience: 'all',
  });

  const { data: notifications, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const sendMutation = useMutation({
    mutationFn: async (data: NotificationForm) => {
      const { error } = await supabase.from('notifications').insert({
        title: data.title,
        message: data.message,
        image_url: data.image_url || null,
        target_audience: data.target_audience,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowModal(false);
      setForm({
        title: '',
        message: '',
        image_url: '',
        target_audience: 'all',
      });
      toast.success('تم إرسال الإشعار بنجاح');
    },
    onError: () => toast.error('حدث خطأ في إرسال الإشعار'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5 text-primary" />
          <h2 className="font-bold">الإشعارات</h2>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 ml-2" />
          إرسال إشعار
        </Button>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-muted rounded-xl"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold">{notification.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    notification.status === 'sent' ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'
                  }`}>
                    {notification.status === 'sent' ? 'تم الإرسال' : 'مجدول'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>
                    {notification.target_audience === 'all' ? 'الجميع' : notification.target_audience}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    {notification.sent_at 
                      ? new Date(notification.sent_at).toLocaleDateString('ar-EG', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      : 'لم يرسل'
                    }
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">لا توجد إشعارات</p>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>إرسال إشعار جديد</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">العنوان</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عنوان الإشعار..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">الرسالة</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                placeholder="نص الإشعار..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">رابط الصورة (اختياري)</label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">الجمهور المستهدف</label>
              <Select
                value={form.target_audience}
                onValueChange={(value) => setForm({ ...form, target_audience: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">الجميع</SelectItem>
                  <SelectItem value="new_users">المستخدمون الجدد</SelectItem>
                  <SelectItem value="active_users">المستخدمون النشطون</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full" 
              onClick={() => sendMutation.mutate(form)}
              disabled={sendMutation.isPending || !form.title || !form.message}
            >
              <Send className="w-4 h-4 ml-2" />
              {sendMutation.isPending ? 'جاري الإرسال...' : 'إرسال الإشعار'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
