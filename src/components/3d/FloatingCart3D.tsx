import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/stores/cartStore';
import { ShoppingCart, Trash2, Minus, Plus, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Village {
  id: string;
  name: string;
  delivery_fee: number;
  district_id: string;
}

interface FloatingCart3DProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVillage?: Village;
  onChangeVillage: () => void;
}

export function FloatingCart3D({ 
  isOpen, 
  onClose, 
  selectedVillage, 
  onChangeVillage 
}: FloatingCart3DProps) {
  const { items, updateQuantity, removeItem, getTotal, getItemCount } = useCartStore();
  const subtotal = getTotal();
  const deliveryFee = selectedVillage?.delivery_fee || 0;
  const platformFee = 0; // Already included in product prices
  const total = subtotal + deliveryFee;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-background/50 backdrop-blur-sm"
          />
          
          {/* Cart panel */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-full max-w-md bg-card shadow-elevated overflow-hidden"
          >
            {/* Neon border effect */}
            <div className="absolute inset-y-0 right-0 w-1 bg-gradient-to-b from-primary via-accent to-primary shadow-[0_0_20px_hsl(var(--primary))]" />
            
            {/* Header */}
            <div className="p-4 border-b flex items-center justify-between bg-card/95 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <ShoppingCart className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-bold text-lg">السلة</h2>
                  <p className="text-sm text-muted-foreground">{getItemCount()} منتجات</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Village selection */}
            <div className="p-4 bg-muted/50 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">التوصيل إلى:</span>
                </div>
                <Button variant="outline" size="sm" onClick={onChangeVillage}>
                  {selectedVillage ? selectedVillage.name : 'اختر المنطقة'}
                </Button>
              </div>
              {selectedVillage && (
                <p className="text-sm text-muted-foreground mt-1 mr-6">
                  رسوم التوصيل: <span className="text-primary font-bold">{selectedVillage.delivery_fee} ج.م</span>
                </p>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: 'calc(100vh - 380px)' }}>
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="text-6xl mb-4"
                  >
                    🛒
                  </motion.div>
                  <p className="text-muted-foreground">السلة فارغة</p>
                </div>
              ) : (
                items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="bg-background rounded-2xl p-3 shadow-soft flex gap-3"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
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
                    
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm truncate">{item.name}</p>
                      {item.size && (
                        <p className="text-xs text-muted-foreground">{item.size}</p>
                      )}
                      <p className="text-primary font-bold text-sm mt-1">
                        {item.price * item.quantity} ج.م
                      </p>
                    </div>
                    
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                      
                      <div className="flex items-center gap-1 bg-secondary rounded-full p-0.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <span className="w-5 text-center text-sm font-bold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Summary */}
            {items.length > 0 && (
              <div className="border-t p-4 bg-card/95 backdrop-blur-sm">
                {/* Price breakdown */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">المجموع</span>
                    <span>{subtotal} ج.م</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">التوصيل</span>
                    <span>{deliveryFee > 0 ? `${deliveryFee} ج.م` : 'يُحدد عند اختيار المنطقة'}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span className="font-bold">الإجمالي</span>
                    {/* Neon price effect */}
                    <span className="text-2xl font-bold text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]">
                      {total} ج.م
                    </span>
                  </div>
                </div>
                
                <Link to="/checkout" onClick={onClose}>
                  <Button className="w-full h-12 text-lg rounded-xl" size="lg">
                    إتمام الطلب
                  </Button>
                </Link>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Floating cart button
export function FloatingCartButton({ onClick }: { onClick: () => void }) {
  const itemCount = useCartStore((state) => state.getItemCount());
  
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-elevated flex items-center justify-center"
      style={{
        boxShadow: '0 0 20px hsl(var(--primary) / 0.5)'
      }}
    >
      <ShoppingCart className="w-6 h-6" />
      {itemCount > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-1 -right-1 w-6 h-6 bg-destructive text-destructive-foreground text-xs font-bold rounded-full flex items-center justify-center"
        >
          {itemCount}
        </motion.span>
      )}
    </motion.button>
  );
}
