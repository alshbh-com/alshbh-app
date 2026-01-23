import { motion } from 'framer-motion';
import { ArrowRight, User, Phone, Save } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUserStore } from '@/stores/userStore';
import { useState } from 'react';
import { toast } from 'sonner';

const EditProfile = () => {
  const navigate = useNavigate();
  const { name, phone, setName, setPhone } = useUserStore();
  const [formData, setFormData] = useState({
    name: name || '',
    phone: phone || '',
  });

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error('يرجى إدخال الاسم');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    
    // Validate phone number format
    const phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (!phoneRegex.test(formData.phone)) {
      toast.error('رقم الهاتف غير صحيح');
      return;
    }

    setName(formData.name.trim());
    setPhone(formData.phone.trim());
    toast.success('تم حفظ البيانات بنجاح');
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">تعديل الملف الشخصي</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center mb-8"
        >
          <div className="w-24 h-24 rounded-full bg-gradient-to-bl from-primary to-accent flex items-center justify-center mb-4">
            <User className="w-12 h-12 text-primary-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">تعديل بياناتك الشخصية</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <Label htmlFor="name" className="flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              الاسم
            </Label>
            <Input
              id="name"
              placeholder="أدخل اسمك"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-12"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" />
              رقم الهاتف
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="01xxxxxxxxx"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="h-12"
              dir="ltr"
            />
            <p className="text-xs text-muted-foreground">
              يجب أن يبدأ بـ 01 ويتكون من 11 رقم
            </p>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full h-12 gap-2"
          >
            <Save className="w-5 h-5" />
            حفظ التغييرات
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-4 bg-muted rounded-xl"
        >
          <p className="text-sm text-muted-foreground text-center">
            بياناتك الشخصية محفوظة على جهازك فقط ولا يتم مشاركتها مع أي طرف ثالث
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
