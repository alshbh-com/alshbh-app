import { AppLayout } from '@/components/layout/AppLayout';
import { useCartStore } from '@/stores/cartStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Cart = () => {
  const { items, updateQuantity, removeItem, getTotal, clearCart } = useCartStore();
  const total = getTotal();

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
            <Link to="/">
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
              <div className="flex justify-between items-center mb-2">
                <span className="text-muted-foreground">المجموع</span>
                <span className="font-bold">{total} جنيه</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-muted-foreground">التوصيل</span>
                <span className="text-sm text-muted-foreground">يُحدد عند الطلب</span>
              </div>
              <div className="border-t pt-4 flex justify-between items-center">
                <span className="font-bold text-lg">الإجمالي</span>
                <span className="font-bold text-xl text-primary">{total} جنيه</span>
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
                <Button className="w-full" size="lg">
                  إتمام الطلب
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