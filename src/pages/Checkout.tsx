import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Phone, User, FileText, Send, Navigation, MapPinned, Loader2 } from 'lucide-react';
import { useCartStore } from '@/stores/cartStore';
import { useUserStore } from '@/stores/userStore';
import { useGeolocation } from '@/hooks/useGeolocation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const PLATFORM_FEE_FIRST_ITEM = 10; // 10 EGP for first item
const PLATFORM_FEE_ADDITIONAL = 5; // 5 EGP for each additional item

interface SavedLocation {
  district: {
    id: string;
    name: string;
    whatsappNumber?: string;
  };
  village: {
    id: string;
    name: string;
    deliveryFee: number;
  };
}

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getTotal, clearCart, getItemCount } = useCartStore();
  const { name, phone, address, setUserInfo } = useUserStore();
  const { latitude, longitude, loading: geoLoading, requestLocation } = useGeolocation();
  const [savedLocation, setSavedLocation] = useState<SavedLocation | null>(null);
  
  const [formData, setFormData] = useState({
    name: name || '',
    phone: phone || '',
    address: address || '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [customerLat, setCustomerLat] = useState<number | null>(null);
  const [customerLng, setCustomerLng] = useState<number | null>(null);

  // Load saved location from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('alshbh_selected_location');
    if (saved) {
      try {
        setSavedLocation(JSON.parse(saved));
      } catch (e) {
        console.error('Error parsing saved location:', e);
      }
    }
  }, []);

  // Auto-request location on mount
  useEffect(() => {
    requestLocation().then((loc) => {
      if (loc) {
        setCustomerLat(loc.latitude);
        setCustomerLng(loc.longitude);
      }
    });
  }, []);

  const deliveryFee = savedLocation?.village?.deliveryFee || 0;
  const itemCount = getItemCount();
  const platformFee = itemCount > 0 ? PLATFORM_FEE_FIRST_ITEM + (itemCount - 1) * PLATFORM_FEE_ADDITIONAL : 0;
  const subtotal = getTotal();
  const total = subtotal + deliveryFee + platformFee;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleChangeLocation = () => {
    localStorage.removeItem('alshbh_selected_location');
    navigate('/');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.phone) {
      toast.error('يرجى ملء جميع البيانات المطلوبة');
      return;
    }

    if (!savedLocation) {
      toast.error('يرجى اختيار منطقة التوصيل');
      navigate('/');
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

      // Save order to database FIRST to get the auto-generated order_number
      const orderData = {
        customer_name: formData.name,
        customer_phone: formData.phone,
        customer_city: savedLocation.district.name,
        district_id: savedLocation.district.id,
        district_name: savedLocation.district.name,
        village_id: savedLocation.village.id,
        village_name: savedLocation.village.name,
        customer_location: formData.address,
        customer_latitude: customerLat,
        customer_longitude: customerLng,
        items: items.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.quantity,
          price: item.price,
        })),
        total_amount: total,
        delivery_fee: deliveryFee,
        platform_fee: platformFee,
        status: 'pending',
      };

      const { data: savedOrder, error } = await supabase
        .from('orders')
        .insert(orderData)
        .select('order_number')
        .single();
      
      if (error) {
        console.error('Error saving order:', error);
        toast.error('حدث خطأ أثناء حفظ الطلب');
        setLoading(false);
        return;
      }

      const orderNumber = savedOrder?.order_number || 0;

      // Create order message for WhatsApp
      let message = `🍽️ *طلب جديد من الشبح فود - #${orderNumber}*\n\n`;
      message += `👤 *الاسم:* ${formData.name}\n`;
      message += `📱 *الهاتف:* ${formData.phone}\n`;
      message += `📍 *المركز:* ${savedLocation.district.name}\n`;
      message += `🏘️ *القرية:* ${savedLocation.village.name}\n`;
      if (formData.address) {
        message += `🏠 *العنوان:* ${formData.address}\n`;
      }
      
      // Add location link if available
      if (customerLat && customerLng) {
        message += `📌 *الموقع:* https://www.google.com/maps?q=${customerLat},${customerLng}\n`;
      }
      
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
      message += `💰 *المجموع:* ${subtotal} ج.م\n`;
      message += `🚚 *التوصيل (${savedLocation.village.name}):* ${deliveryFee} ج.م\n`;
      message += `📦 *رسوم المنصة (${itemCount === 1 ? 'قطعة واحدة' : `${itemCount} قطع`}):* ${platformFee} ج.م\n`;
      message += `💵 *الإجمالي:* ${total} ج.م`;

      // Clear cart and show thank you
      clearCart();
      navigate('/order-success', { state: { orderNumber } });
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
          <Button onClick={() => navigate('/home')}>تصفح المطاعم</Button>
        </div>
      </div>
    );
  }

  if (!savedLocation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📍</div>
          <h2 className="text-xl font-bold mb-2">اختر منطقة التوصيل</h2>
          <p className="text-muted-foreground mb-4">يرجى اختيار المركز والقرية أولاً</p>
          <Button onClick={() => navigate('/')}>اختيار المنطقة</Button>
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
        {/* Delivery Location Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-4 mb-6 border border-primary/20"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                <Navigation className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">التوصيل إلى</p>
                <p className="font-bold text-lg">{savedLocation.district.name}</p>
                <p className="text-primary font-medium">{savedLocation.village.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  سعر التوصيل: <span className="font-bold text-foreground">{deliveryFee} ج.م</span>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangeLocation}>
              تغيير
            </Button>
          </div>
        </motion.div>

        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
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
            <div className="border-t pt-3 mt-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span>المجموع</span>
                <span>{subtotal} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>التوصيل ({savedLocation.village.name})</span>
                <span className="text-primary font-medium">{deliveryFee} ج.م</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>رسوم المنصة ({itemCount === 1 ? 'قطعة واحدة' : `${itemCount} قطع`})</span>
                <span className="text-accent font-medium">{platformFee} ج.م</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t">
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
          transition={{ delay: 0.2 }}
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
              placeholder="العنوان بالتفصيل (اختياري)"
              value={formData.address}
              onChange={handleChange}
              className="pr-10 min-h-[100px] rounded-xl resize-none"
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
