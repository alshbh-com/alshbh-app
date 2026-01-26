import { AppLayout } from '@/components/layout/AppLayout';
import { useCartStore } from '@/stores/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag, MapPin, Navigation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

interface SavedLocation {
  district: {
    id: string;
    name: string;
  };
  village: {
    id: string;
    name: string;
    deliveryFee: number;
  };
}

const PLATFORM_FEE_FIRST_ITEM = 10; // رسوم المنصة للقطعة الأولى
const PLATFORM_FEE_ADDITIONAL = 5; // رسوم المنصة لكل قطعة إضافية

const Cart = () => {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotal, clearCart, getItemCount } = useCartStore();
  const [location, setLocation] = useState<SavedLocation | null>(null);
  const subtotal = getTotal();

  // Load saved location
  useEffect(() => {
    const savedLocation = localStorage.getItem('alshbh_selected_location');
    if (savedLocation) {
      try {
        setLocation(JSON.parse(savedLocation));
      } catch (e) {
        console.error('Failed to parse saved location');
      }
    }
  }, []);

  const deliveryFee = location?.village?.deliveryFee || 0;
  const itemCount = getItemCount();
  const platformFee = itemCount > 0 ? PLATFORM_FEE_FIRST_ITEM + (itemCount - 1) * PLATFORM_FEE_ADDITIONAL : 0;
  const grandTotal = subtotal + deliveryFee + platformFee;

  const handleChangeLocation = () => {
    localStorage.removeItem('alshbh_selected_location');
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="container py-6 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          سلة المشتريات
        </motion.h1>

        {/* Location Card - Always Show */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-4 mb-6 border border-primary/20"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">التوصيل إلى</p>
                {location ? (
                  <>
                    <p className="font-bold">{location.village.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {location.district.name}
                    </p>
                  </>
                ) : (
                  <p className="font-bold text-destructive">لم يتم تحديد الموقع</p>
                )}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleChangeLocation}
              className="gap-2"
            >
              <Navigation className="w-4 h-4" />
              تغيير
            </Button>
          </div>
          
          {location && (
            <div className="mt-3 pt-3 border-t border-primary/20 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">رسوم التوصيل</span>
              <span className="font-bold text-primary">{deliveryFee} ج.م</span>
            </div>
          )}
        </motion.div>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">السلة فارغة</h2>
            <p className="text-muted-foreground mb-6">
              لم تضف أي منتجات بعد
            </p>
            <Link to="/home">
              <Button size="lg">تصفح المطاعم</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-card rounded-2xl p-4 shadow-soft flex gap-4"
                >
                  {/* Image */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-muted">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">
                        🍽️
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{item.name}</h3>
                    {item.size && (
                      <p className="text-sm text-muted-foreground">{item.size}</p>
                    )}
                    <p className="text-primary font-bold mt-1">
                      {item.price} جنيه
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end justify-between">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>

                    <div className="flex items-center gap-2 bg-secondary rounded-full p-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-6 text-center font-bold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-2xl p-4 shadow-soft mt-6"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">المجموع</span>
                <span className="font-bold">{subtotal} ج.م</span>
              </div>
              
              <div className="flex justify-between items-center mb-3">
                <span className="text-muted-foreground">رسوم التوصيل ({location?.village?.name || 'غير محدد'})</span>
                <span className="font-bold text-primary">{deliveryFee} ج.م</span>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">رسوم المنصة ({itemCount === 1 ? 'قطعة واحدة' : `${itemCount} قطع`})</span>
                <span className="font-medium text-accent-foreground">{platformFee} ج.م</span>
              </div>
              
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">الإجمالي</span>
                <span className="font-bold text-2xl text-primary">{grandTotal} ج.م</span>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={clearCart}
              >
                إفراغ السلة
              </Button>
              <Link to="/checkout" className="flex-1">
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!location}
                >
                  {location ? 'إتمام الطلب' : 'حدد موقعك أولاً'}
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Cart;
