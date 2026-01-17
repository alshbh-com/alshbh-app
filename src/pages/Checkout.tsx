import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, User, FileText, Send } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart } = useCartStore();
  const { name, phone, address, setUserInfo } = useUserStore();
  
  const [formData, setFormData] = useState({
    name: name || '',
    phone: phone || '',
    address: address || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  const deliveryFee = 10;
  const total = getTotal() + deliveryFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone || !formData.address) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    if (items.length === 0) {
      toast.error('السلة فارغة');
      return;
    }

    setLoading(true);

    try {
      // Save user info
      setUserInfo(formData.name, formData.phone, formData.address);

      // Group items by restaurant
      const restaurantItems: Record<string, typeof items> = {};
      items.forEach((item) => {
        if (!restaurantItems[item.restaurantId]) {
          restaurantItems[item.restaurantId] = [];
        }
        restaurantItems[item.restaurantId].push(item);
      });

      // Create order message for WhatsApp
      let message = `🍽️ *طلب جديد من الشبح*\n\n`;
      message += `👤 *الاسم:* ${formData.name}\n`;
      message += `📱 *الهاتف:* ${formData.phone}\n`;
      message += `📍 *العنوان:* ${formData.address}\n`;
      if (formData.notes) {
        message += `📝 *ملاحظات:* ${formData.notes}\n`;
      }
      message += `\n━━━━━━━━━━━━━━━\n`;
      message += `🛒 *الطلبات:*\n\n`;

      items.forEach((item) => {
        message += `• ${item.name}`;
        if (item.size) message += ` (${item.size})`;
        message += ` × ${item.quantity}`;
        message += ` = ${item.price * item.quantity} ج.م\n`;
      });

      message += `\n━━━━━━━━━━━━━━━\n`;
      message += `💰 *المجموع:* ${getTotal()} ج.م\n`;
      message += `🚚 *التوصيل:* ${deliveryFee} ج.م\n`;
      message += `💵 *الإجمالي:* ${total} ج.م`;

      // Save order to database
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_city: formData.address,
        customer_location: formData.address,
        items: items.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: total,
        delivery_fee: deliveryFee,
        status: 'pending',
      };

      const { error } = await supabase.from('orders').insert(orderData);
      
      if (error) {
        console.error('Error saving order:', error);
      }

      // Open WhatsApp
      const whatsappNumber = '201278006248';
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');

      // Clear cart and redirect
      clearCart();
      toast.success('تم إرسال الطلب بنجاح!');
      navigate('/orders');
    } catch (error) {
      console.error('Error:', error);
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold mb-2">السلة فارغة</h2>
          <p className="text-muted-foreground mb-4">أضف بعض الأصناف للمتابعة</p>
          <Button onClick={() => navigate('/')}>تصفح المطاعم</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">إتمام الطلب</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4 max-w-lg mx-auto">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 mb-6 shadow-soft"
        >
          <h2 className="font-bold mb-4">ملخص الطلب</h2>
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.name} {item.size && `(${item.size})`} × {item.quantity}
                </span>
                <span className="font-medium">{item.price * item.quantity} ج.م</span>
              </div>
            ))}
            <div className="border-t pt-3 mt-3">
              <div className="flex justify-between text-sm">
                <span>المجموع</span>
                <span>{getTotal()} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>رسوم التوصيل</span>
                <span>{deliveryFee} ج.م</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2">
                <span>الإجمالي</span>
                <span className="text-primary">{total} ج.م</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Delivery Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <h2 className="font-bold mb-4">بيانات التوصيل</h2>

          <div className="relative">
            <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              name="name"
              placeholder="الاسم الكامل *"
              value={formData.name}
              onChange={handleChange}
              className="pr-10 h-12 rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              name="phone"
              type="tel"
              placeholder="رقم الهاتف *"
              value={formData.phone}
              onChange={handleChange}
              className="pr-10 h-12 rounded-xl"
              required
            />
          </div>

          <div className="relative">
            <MapPin className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Textarea
              name="address"
              placeholder="العنوان بالتفصيل *"
              value={formData.address}
              onChange={handleChange}
              className="pr-10 min-h-[100px] rounded-xl resize-none"
              required
            />
          </div>

          <div className="relative">
            <FileText className="absolute right-3 top-3 w-5 h-5 text-muted-foreground" />
            <Textarea
              name="notes"
              placeholder="ملاحظات إضافية (اختياري)"
              value={formData.notes}
              onChange={handleChange}
              className="pr-10 min-h-[80px] rounded-xl resize-none"
            />
          </div>

          <Button
            type="submit"
            className="w-full h-14 text-lg rounded-xl"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
                جاري الإرسال...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                إرسال الطلب عبر واتساب
              </span>
            )}
          </Button>
        </motion.form>
      </div>
    </div>
  );
};

export default Checkout;
