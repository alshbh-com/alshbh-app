import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, Sparkles, Percent } from 'lucide-react';

interface OfferForm {
  id?: string;
  title: string;
  description: string;
  image_url: string;
  discount_percentage: number;
  price: number;
  original_price: number;
  is_active: boolean;
}

export const AdminOffers = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<OfferForm>({
    title: '',
    description: '',
    image_url: '',
    discount_percentage: 0,
    price: 0,
    original_price: 0,
    is_active: true,
  });

  const { data: offers, isLoading } = useQuery({
    queryKey: ['admin-offers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: OfferForm) => {
      if (data.id) {
        const { error } = await supabase
          .from('offers')
          .update({
            title: data.title,
            description: data.description,
            image_url: data.image_url,
            discount_percentage: data.discount_percentage,
            price: data.price,
            original_price: data.original_price,
            is_active: data.is_active,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('offers').insert({
          title: data.title,
          description: data.description,
          image_url: data.image_url,
          discount_percentage: data.discount_percentage,
          price: data.price,
          original_price: data.original_price,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      setShowModal(false);
      toast.success(form.id ? 'تم تحديث العرض' : 'تم إضافة العرض');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('offers').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-offers'] });
      toast.success('تم حذف العرض');
    },
    onError: () => toast.error('حدث خطأ'),
  });

  const openModal = (offer?: typeof offers[number]) => {
    if (offer) {
      setForm({
        id: offer.id,
        title: offer.title,
        description: offer.description || '',
        image_url: offer.image_url || '',
        discount_percentage: offer.discount_percentage || 0,
        price: (offer as any).price || 0,
        original_price: (offer as any).original_price || 0,
        is_active: offer.is_active ?? true,
      });
    } else {
      setForm({
        title: '',
        description: '',
        image_url: '',
        discount_percentage: 0,
        price: 0,
        original_price: 0,
        is_active: true,
      });
    }
    setShowModal(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-accent" />
          <h2 className="font-bold">العروض الترويجية</h2>
        </div>
        <Button onClick={() => openModal()}>
          <Plus className="w-4 h-4 ml-2" />
          إضافة عرض
        </Button>
      </div>

      {offers && offers.length > 0 ? (
        <div className="space-y-3">
          {offers.map((offer) => (
            <motion.div
              key={offer.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-4 p-3 bg-muted rounded-xl"
            >
              {offer.image_url && (
                <img
                  src={offer.image_url}
                  alt={offer.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold">{offer.title}</p>
                  {offer.discount_percentage && (
                    <span className="bg-accent/20 text-accent px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                      <Percent className="w-3 h-3" />
                      {offer.discount_percentage}%
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-1">{offer.description}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${offer.is_active ? 'bg-success' : 'bg-destructive'}`} />
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" onClick={() => openModal(offer)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-destructive"
                  onClick={() => {
                    if (confirm('هل تريد حذف هذا العرض؟')) {
                      deleteMutation.mutate(offer.id);
                    }
                  }}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground py-8">لا توجد عروض</p>
      )}

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? 'تعديل العرض' : 'إضافة عرض جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">اسم العرض</label>
              <Input
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="عرض خاص..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">الوصف</label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="تفاصيل العرض..."
              />
            </div>
            <div>
              <label className="text-sm font-medium">رابط الصورة</label>
              <Input
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">السعر</label>
                <Input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">السعر الأصلي</label>
                <Input
                  type="number"
                  value={form.original_price}
                  onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) })}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">نسبة الخصم %</label>
              <Input
                type="number"
                value={form.discount_percentage}
                onChange={(e) => setForm({ ...form, discount_percentage: Number(e.target.value) })}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">نشط</label>
              <Switch
                checked={form.is_active}
                onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveMutation.mutate(form)}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
