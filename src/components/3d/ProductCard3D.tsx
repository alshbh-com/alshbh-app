import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/stores/cartStore';
import { toast } from 'sonner';

interface SizePrice {
  name: string;
  price: number;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  price: number;
  sizes_and_prices?: SizePrice[];
  sub_category_id?: string;
  restaurantName?: string;
}

interface ProductCard3DProps {
  product: Product;
  platformFee?: number;
}

export function ProductCard3D({ product, platformFee = 10 }: ProductCard3DProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedSize, setSelectedSize] = useState<SizePrice | null>(null);
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCartStore();

  const sizes = product.sizes_and_prices?.filter(s => s.price > 0) || [];
  const hasMultipleSizes = sizes.length > 0;
  const currentPrice = selectedSize?.price || (hasMultipleSizes ? sizes[0].price : product.price);
  const totalPrice = (currentPrice + platformFee) * quantity;

  const handleAddToCart = () => {
    const sizeName = selectedSize?.name || (hasMultipleSizes ? sizes[0].name : undefined);
    const price = currentPrice + platformFee;
    
    addItem({
      productId: product.id,
      name: product.name,
      price: price,
      quantity: quantity,
      image: product.image_url,
      size: sizeName,
      restaurantId: product.sub_category_id,
      restaurantName: product.restaurantName,
    });

    // Animation feedback
    toast.success(
      <div className="flex items-center gap-2">
        <span>تم إضافة {product.name} للسلة</span>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="text-lg"
        >
          🛒
        </motion.span>
      </div>
    );

    setQuantity(1);
    setIsFlipped(false);
  };

  return (
    <motion.div
      className="relative h-[380px] w-full perspective-1000"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -5 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="relative w-full h-full transition-transform duration-500 preserve-3d"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front of card */}
        <div
          className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden bg-card shadow-elevated border border-border/50"
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Image with gradient overlay */}
          <div className="relative h-48 overflow-hidden">
            <img
              src={product.image_url || '/placeholder.svg'}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
            
            {/* Price badge */}
            <div className="absolute top-3 left-3 bg-primary text-primary-foreground px-3 py-1 rounded-full font-bold text-sm shadow-lg">
              {hasMultipleSizes ? `من ${sizes[0].price}` : currentPrice} ج.م
            </div>
            
            {/* Platform fee badge */}
            <div className="absolute top-3 right-3 bg-accent/90 text-accent-foreground px-2 py-1 rounded-full text-xs">
              +{platformFee} رسوم المنصة
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-bold text-lg mb-1 line-clamp-1">{product.name}</h3>
            {product.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {product.description}
              </p>
            )}
            
            {/* Sizes preview */}
            {hasMultipleSizes && (
              <div className="flex flex-wrap gap-1 mb-3">
                {sizes.slice(0, 3).map((size) => (
                  <span
                    key={size.name}
                    className="text-xs bg-secondary px-2 py-1 rounded-full"
                  >
                    {size.name}
                  </span>
                ))}
                {sizes.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{sizes.length - 3}</span>
                )}
              </div>
            )}

            <Button
              className="w-full rounded-xl"
              onClick={() => setIsFlipped(true)}
            >
              <ShoppingCart className="w-4 h-4 ml-2" />
              أضف للسلة
            </Button>
          </div>
        </div>

        {/* Back of card */}
        <div
          className="absolute inset-0 backface-hidden rounded-3xl overflow-hidden bg-card shadow-elevated border border-primary/30 p-5"
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          <button
            onClick={() => setIsFlipped(false)}
            className="absolute top-3 left-3 text-muted-foreground hover:text-foreground"
          >
            ✕
          </button>

          <h3 className="font-bold text-lg mb-4 text-center">{product.name}</h3>

          {/* Size selection */}
          {hasMultipleSizes && (
            <div className="mb-4">
              <p className="text-sm font-medium mb-2">اختر الحجم:</p>
              <div className="grid grid-cols-2 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size.name}
                    onClick={() => setSelectedSize(size)}
                    className={`p-3 rounded-xl border-2 transition-all text-sm ${
                      (selectedSize?.name || sizes[0].name) === size.name
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <span className="block font-medium">{size.name}</span>
                    <span className="text-xs">{size.price + platformFee} ج.م</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
            >
              <Minus className="w-4 h-4" />
            </Button>
            <span className="text-2xl font-bold w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Total price with neon effect */}
          <div className="text-center mb-4">
            <p className="text-sm text-muted-foreground">الإجمالي</p>
            <p className="text-3xl font-bold text-primary drop-shadow-[0_0_10px_hsl(var(--primary))]">
              {totalPrice} ج.م
            </p>
          </div>

          {/* Add to cart button */}
          <motion.div whileTap={{ scale: 0.95 }}>
            <Button
              className="w-full rounded-xl h-12 text-lg"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="w-5 h-5 ml-2" />
              أضف للسلة
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Floating animation on add */}
      <AnimatePresence>
        {/* Flying cart animation would go here */}
      </AnimatePresence>
    </motion.div>
  );
}
