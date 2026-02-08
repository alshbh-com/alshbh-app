import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Save, Megaphone } from 'lucide-react';

interface AnnouncementForm {
  id?: string;
  message: string;
  type: string;
  image_url: string;
  is_active: boolean;
  show_on_all_pages: boolean;
  sort_order: number;
}

const defaultForm: AnnouncementForm = {
  message: '',
  type: 'info',
  image_url: '',
  is_active: true,
  show_on_all_pages: false,
  sort_order: 0,
};

export const AdminAnnouncements = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<AnnouncementForm>(defaultForm);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: AnnouncementForm) => {
      if (data.id) {
        const { error } = await supabase
          .from('announcements')
          .update({
            message: data.message,
            type: data.type,
            image_url: data.image_url || null,
            is_active: data.is_active,
            show_on_all_pages: data.show_on_all_pages,
            sort_order: data.sort_order,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('announcements').insert({
          message: data.message,
          type: data.type,
          image_url: data.image_url || null,
          is_active: data.is_active,
          show_on_all_pages: data.show_on_all_pages,
          sort_order: data.sort_order,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      setShowModal(false);
      toast.success(form.id ? 'تم تحديث الإعلان' : 'تم إضافة الإعلان');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('announcements').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      queryClient.invalidateQueries({ queryKey: ['announcements'] });
      toast.success('تم حذف الإعلان');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const openModal = (announcement?: any) => {
    if (announcement) {
      setForm({
        id: announcement.id,
        message: announcement.message,
        type: announcement.type || 'info',
        image_url: announcement.image_url || '',
        is_active: announcement.is_active ?? true,
        show_on_all_pages: announcement.show_on_all_pages ?? false,
        sort_order: announcement.sort_order || 0,
      });
    } else {
      setForm(defaultForm);
    }
    setShowModal(true);
  };

  const typeLabel = (type: string) => {
    switch (type) {
      case 'success': return 'نجاح';
      case 'warning': return 'تحذير';
      default: return 'معلومات';
    }
  };

  const typeBadgeClass = (type: string) => {
    switch (type) {
      case 'success': return 'bg-success/20 text-success';
      case 'warning': return 'bg-warning/20 text-warning';
      default: return 'bg-primary/20 text-primary';
    }
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold flex items-center gap-2">
          <Megaphone className="w-5 h-5" />
          الإعلانات
        </h2>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة إعلان
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="space-y-3">
          {announcements.map((ann) => (
            <div key={ann.id} className="flex items-center gap-4 p-3 bg-muted rounded-xl">
              {ann.image_url && (
                <img src={ann.image_url} alt="" className="w-12 h-12 rounded-lg object-cover" />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{ann.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${typeBadgeClass(ann.type)}`}>
                    {typeLabel(ann.type)}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${ann.is_active ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'}`}>
                    {ann.is_active ? 'نشط' : 'معطل'}
                  </span>
                  {ann.show_on_all_pages && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-accent/20 text-accent-foreground">
                      كل الصفحات
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openModal(ann)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => {
                    if (confirm('هل تريد حذف هذا الإعلان؟')) {
                      deleteMutation.mutate(ann.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">لا توجد إعلانات</p>
      )}

      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? 'تعديل الإعلان' : 'إضافة إعلان جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="نص الإعلان *"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الإعلان" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">معلومات (أزرق)</SelectItem>
                <SelectItem value="success">نجاح (أخضر)</SelectItem>
                <SelectItem value="warning">تحذير (أصفر)</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="رابط الصورة (اختياري)"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            />
            <Input
              type="number"
              placeholder="الترتيب"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
            <div className="flex items-center justify-between">
              <span>الإعلان نشط</span>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>عرض في كل الصفحات</span>
              <Switch
                checked={form.show_on_all_pages}
                onCheckedChange={(checked) => setForm({ ...form, show_on_all_pages: checked })}
              />
            </div>
            <Button
              className="w-full"
              onClick={() => saveMutation.mutate(form)}
              disabled={!form.message || saveMutation.isPending}
            >
              <Save className="w-4 h-4 ml-2" />
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
