import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Plus, Trash2, Edit2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Address {
  id: string;
  name: string;
  address: string;
  isDefault: boolean;
}

const Addresses = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const saved = localStorage.getItem('user_addresses');
    return saved ? JSON.parse(saved) : [];
  });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', address: '' });

  const saveAddresses = (newAddresses: Address[]) => {
    setAddresses(newAddresses);
    localStorage.setItem('user_addresses', JSON.stringify(newAddresses));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }

    if (editingId) {
      const updated = addresses.map((a) =>
        a.id === editingId ? { ...a, ...formData } : a
      );
      saveAddresses(updated);
      toast.success('تم تحديث العنوان');
    } else {
      const newAddress: Address = {
        id: Date.now().toString(),
        ...formData,
        isDefault: addresses.length === 0,
      };
      saveAddresses([...addresses, newAddress]);
      toast.success('تم إضافة العنوان');
    }

    setFormData({ name: '', address: '' });
    setShowForm(false);
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const updated = addresses.filter((a) => a.id !== id);
    if (updated.length > 0 && !updated.some((a) => a.isDefault)) {
      updated[0].isDefault = true;
    }
    saveAddresses(updated);
    toast.success('تم حذف العنوان');
  };

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    saveAddresses(updated);
    toast.success('تم تعيين العنوان الافتراضي');
  };

  const handleEdit = (address: Address) => {
    setFormData({ name: address.name, address: address.address });
    setEditingId(address.id);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">عناويني</h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setFormData({ name: '', address: '' });
              setEditingId(null);
              setShowForm(true);
            }}
          >
            <Plus className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="container p-4">
        {/* Add/Edit Form */}
        {showForm && (
          <motion.form
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-card rounded-2xl p-4 mb-4 shadow-soft"
          >
            <h3 className="font-bold mb-4">
              {editingId ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
            </h3>
            <div className="space-y-3">
              <Input
                placeholder="اسم العنوان (مثال: المنزل)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-12 rounded-xl"
              />
              <Textarea
                placeholder="العنوان بالتفصيل"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="min-h-[100px] rounded-xl resize-none"
              />
              <div className="flex gap-2">
                <Button type="submit" className="flex-1">
                  {editingId ? 'تحديث' : 'إضافة'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingId(null);
                    setFormData({ name: '', address: '' });
                  }}
                >
                  إلغاء
                </Button>
              </div>
            </div>
          </motion.form>
        )}

        {/* Addresses List */}
        {addresses.length > 0 ? (
          <div className="space-y-3">
            {addresses.map((address, index) => (
              <motion.div
                key={address.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card rounded-2xl p-4 shadow-soft ${
                  address.isDefault ? 'ring-2 ring-primary' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">{address.name}</h3>
                      {address.isDefault && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          افتراضي
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {address.address}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t">
                  {!address.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs"
                    >
                      <Check className="w-4 h-4 ml-1" />
                      تعيين افتراضي
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(address)}
                    className="text-xs"
                  >
                    <Edit2 className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(address.id)}
                    className="text-xs text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : !showForm ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <div className="text-6xl mb-4">📍</div>
            <h2 className="text-xl font-bold mb-2">لا توجد عناوين</h2>
            <p className="text-muted-foreground mb-4">أضف عنوانك الأول للتوصيل السريع</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة عنوان
            </Button>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

export default Addresses;
