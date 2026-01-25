import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Lock, Store, Package, Power, Plus, Edit2, Trash2, 
  Save, X, Loader2, Image as ImageIcon 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { ImageUpload } from '@/components/ImageUpload';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface SizePrice {
  size: string;
  price: number;
}

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sizes_and_prices: SizePrice[];
  is_active: boolean;
}

const defaultProduct: ProductForm = {
  name: '',
  description: '',
  price: 0,
  image_url: '',
  sizes_and_prices: [],
  is_active: true,
};

const RestaurantPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [restaurantId, setRestaurantId] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  
  const [productDialog, setProductDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductForm>(defaultProduct);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch restaurant data
  const { data: restaurant, refetch: refetchRestaurant } = useQuery({
    queryKey: ['restaurant-panel', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .eq('id', restaurantId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId && authenticated,
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ['restaurant-products', restaurantId],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('sub_category_id', restaurantId)
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId && authenticated,
  });

  // Login handler
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      toast.error('يرجى إدخال كلمة المرور');
      return;
    }

    setAuthLoading(true);
    
    try {
      // Find restaurant by password - use maybeSingle to handle multiple/no results
      const { data, error } = await supabase
        .from('sub_categories')
        .select('id, name, password')
        .eq('password', password.trim())
        .eq('is_active', true);

      if (error) {
        console.error('Database error:', error);
        toast.error('حدث خطأ في البحث');
        return;
      }

      // Check if no restaurant found
      if (!data || data.length === 0) {
        toast.error('كلمة المرور غير صحيحة');
        return;
      }

      // Check if multiple restaurants have the same password (shouldn't happen)
      if (data.length > 1) {
        toast.error('يوجد خطأ في النظام - كلمة المرور مكررة');
        return;
      }

      const restaurant = data[0];
      setRestaurantId(restaurant.id);
      setRestaurantName(restaurant.name);
      setAuthenticated(true);
      toast.success(`مرحباً بك في ${restaurant.name}`);
      
      // Save session
      sessionStorage.setItem('restaurant_session', JSON.stringify({
        id: restaurant.id,
        name: restaurant.name,
        time: Date.now()
      }));
    } catch (error) {
      console.error('Login error:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setAuthLoading(false);
    }
  };

  // Check for existing session
  useEffect(() => {
    const session = sessionStorage.getItem('restaurant_session');
    if (session) {
      try {
        const data = JSON.parse(session);
        // Session valid for 2 hours
        if (Date.now() - data.time < 2 * 60 * 60 * 1000) {
          setRestaurantId(data.id);
          setRestaurantName(data.name);
          setAuthenticated(true);
        } else {
          sessionStorage.removeItem('restaurant_session');
        }
      } catch (e) {
        sessionStorage.removeItem('restaurant_session');
      }
    }
  }, []);

  // Toggle restaurant open/closed
  const toggleOpenMutation = useMutation({
    mutationFn: async (isOpen: boolean) => {
      const { error } = await supabase
        .from('sub_categories')
        .update({ is_open: isOpen })
        .eq('id', restaurantId);
      if (error) throw error;
    },
    onSuccess: () => {
      refetchRestaurant();
      toast.success(restaurant?.is_open ? 'تم إغلاق المطعم' : 'تم فتح المطعم');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  // Save product mutation
  const saveProductMutation = useMutation({
    mutationFn: async (product: ProductForm) => {
      const productData = {
        name: product.name,
        description: product.description,
        price: product.price,
        image_url: product.image_url,
        sizes_and_prices: JSON.parse(JSON.stringify(product.sizes_and_prices)),
        is_active: product.is_active,
        sub_category_id: restaurantId,
      };

      if (product.id) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products', restaurantId] });
      setProductDialog(false);
      setEditingProduct(defaultProduct);
      toast.success(editingProduct.id ? 'تم تحديث المنتج' : 'تم إضافة المنتج');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحفظ');
    },
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-products', restaurantId] });
      setDeleteConfirm(null);
      toast.success('تم حذف المنتج');
    },
    onError: () => {
      toast.error('حدث خطأ أثناء الحذف');
    },
  });

  const handleLogout = () => {
    sessionStorage.removeItem('restaurant_session');
    setAuthenticated(false);
    setRestaurantId(null);
    setPassword('');
  };

  const openEditProduct = (product: any) => {
    setEditingProduct({
      id: product.id,
      name: product.name,
      description: product.description || '',
      price: product.price,
      image_url: product.image_url || '',
      sizes_and_prices: Array.isArray(product.sizes_and_prices) ? product.sizes_and_prices : [],
      is_active: product.is_active,
    });
    setProductDialog(true);
  };

  const addSizePrice = () => {
    setEditingProduct({
      ...editingProduct,
      sizes_and_prices: [...editingProduct.sizes_and_prices, { size: '', price: 0 }],
    });
  };

  const updateSizePrice = (index: number, field: 'size' | 'price', value: string | number) => {
    const updated = [...editingProduct.sizes_and_prices];
    updated[index] = { ...updated[index], [field]: value };
    setEditingProduct({ ...editingProduct, sizes_and_prices: updated });
  };

  const removeSizePrice = (index: number) => {
    setEditingProduct({
      ...editingProduct,
      sizes_and_prices: editingProduct.sizes_and_prices.filter((_, i) => i !== index),
    });
  };

  // Login Screen
  if (!authenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Store className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">لوحة تحكم المطعم</h1>
            <p className="text-muted-foreground mt-2">أدخل كلمة المرور الخاصة بمطعمك</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pr-10 h-12 rounded-xl text-lg"
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={authLoading}>
              {authLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'دخول'
              )}
            </Button>
          </form>

          <Button
            variant="ghost"
            className="w-full mt-4"
            onClick={() => navigate('/home')}
          >
            <ArrowRight className="w-4 h-4 ml-2" />
            العودة للرئيسية
          </Button>
        </motion.div>
      </div>
    );
  }

  // Restaurant Panel
  return (
    <div className="min-h-screen bg-background pb-8">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-bold">{restaurantName}</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4 max-w-2xl mx-auto">
        {/* Restaurant Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-4 mb-6 shadow-soft"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                restaurant?.is_open ? 'bg-green-500/20' : 'bg-red-500/20'
              }`}>
                <Power className={`w-6 h-6 ${
                  restaurant?.is_open ? 'text-green-500' : 'text-red-500'
                }`} />
              </div>
              <div>
                <p className="font-bold">حالة المطعم</p>
                <p className={`text-sm ${
                  restaurant?.is_open ? 'text-green-500' : 'text-red-500'
                }`}>
                  {restaurant?.is_open ? 'مفتوح الآن' : 'مغلق'}
                </p>
              </div>
            </div>
            <Switch
              checked={restaurant?.is_open ?? false}
              onCheckedChange={(checked) => toggleOpenMutation.mutate(checked)}
              disabled={toggleOpenMutation.isPending}
            />
          </div>
        </motion.div>

        {/* Products Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Package className="w-5 h-5" />
              المنتجات ({products?.length || 0})
            </h2>
            <Button onClick={() => { setEditingProduct(defaultProduct); setProductDialog(true); }}>
              <Plus className="w-4 h-4 ml-2" />
              إضافة منتج
            </Button>
          </div>

          {productsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-muted rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products && products.length > 0 ? (
            <div className="space-y-3">
              {products.map((product) => (
                <motion.div
                  key={product.id}
                  layout
                  className="bg-card rounded-xl p-4 shadow-soft flex items-center gap-4"
                >
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold truncate">{product.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                      }`}>
                        {product.is_active ? 'نشط' : 'معطل'}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{product.description}</p>
                    <p className="text-primary font-bold">{product.price} ج.م</p>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => openEditProduct(product)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={() => setDeleteConfirm(product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl">
              <Package className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">لا توجد منتجات</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Product Dialog */}
      <Dialog open={productDialog} onOpenChange={setProductDialog}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingProduct.id ? 'تعديل منتج' : 'إضافة منتج جديد'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <ImageUpload
              value={editingProduct.image_url}
              onChange={(url) => setEditingProduct({ ...editingProduct, image_url: url })}
              folder="products"
            />
            
            <Input
              placeholder="اسم المنتج"
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
            />
            
            <Textarea
              placeholder="وصف المنتج"
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
            />
            
            <Input
              type="number"
              placeholder="السعر الأساسي"
              value={editingProduct.price || ''}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
            />

            {/* Sizes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium">الأحجام والأسعار</p>
                <Button type="button" variant="outline" size="sm" onClick={addSizePrice}>
                  <Plus className="w-3 h-3 ml-1" />
                  إضافة حجم
                </Button>
              </div>
              <div className="space-y-2">
                {editingProduct.sizes_and_prices.map((sp, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <Input
                      placeholder="الحجم (مثال: صغير)"
                      value={sp.size}
                      onChange={(e) => updateSizePrice(index, 'size', e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="number"
                      placeholder="السعر"
                      value={sp.price || ''}
                      onChange={(e) => updateSizePrice(index, 'price', Number(e.target.value))}
                      className="w-24"
                    />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeSizePrice(index)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>المنتج نشط</span>
              <Switch
                checked={editingProduct.is_active}
                onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setProductDialog(false)}>إلغاء</Button>
            <Button 
              onClick={() => saveProductMutation.mutate(editingProduct)}
              disabled={saveProductMutation.isPending || !editingProduct.name}
            >
              {saveProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 ml-2" />}
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>تأكيد الحذف</DialogTitle>
          </DialogHeader>
          <p>هل أنت متأكد من حذف هذا المنتج؟</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>إلغاء</Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteConfirm && deleteProductMutation.mutate(deleteConfirm)}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حذف'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RestaurantPanel;
