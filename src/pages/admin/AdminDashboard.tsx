import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  LayoutDashboard,
  Store,
  Package,
  ClipboardList,
  DollarSign,
  TrendingUp,
  LogOut,
  Bell,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Ruler,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type ActiveTab = 'dashboard' | 'restaurants' | 'products' | 'orders' | 'cities';

interface SizePrice {
  name: string;
  price: number;
  [key: string]: string | number;
}

interface ProductForm {
  id?: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  sub_category_id: string;
  is_active: boolean;
  sizes_and_prices: SizePrice[];
}

interface RestaurantForm {
  id?: string;
  name: string;
  description: string;
  image_url: string;
  whatsapp_number: string;
  delivery_fee: number;
  delivery_time_min: number;
  delivery_time_max: number;
  is_active: boolean;
  is_open: boolean;
}

interface CityForm {
  id?: string;
  name: string;
  delivery_price: number;
  is_active: boolean;
}

const defaultSizes: SizePrice[] = [
  { name: 'كيلو', price: 0 },
  { name: 'نص كيلو', price: 0 },
  { name: 'ربع كيلو', price: 0 },
  { name: 'تمن كيلو', price: 0 },
  { name: 'كبير', price: 0 },
  { name: 'وسط', price: 0 },
  { name: 'صغير', price: 0 },
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  
  // Modals
  const [showRestaurantModal, setShowRestaurantModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  
  // Forms
  const [restaurantForm, setRestaurantForm] = useState<RestaurantForm>({
    name: '',
    description: '',
    image_url: '',
    whatsapp_number: '',
    delivery_fee: 10,
    delivery_time_min: 30,
    delivery_time_max: 45,
    is_active: true,
    is_open: true,
  });
  
  const [productForm, setProductForm] = useState<ProductForm>({
    name: '',
    description: '',
    price: 0,
    image_url: '',
    sub_category_id: '',
    is_active: true,
    sizes_and_prices: [],
  });
  
  const [cityForm, setCityForm] = useState<CityForm>({
    name: '',
    delivery_price: 10,
    is_active: true,
  });

  // Check authentication
  useEffect(() => {
    const isAuth = localStorage.getItem('admin_authenticated');
    const authTime = localStorage.getItem('admin_auth_time');
    const SESSION_DURATION = 2 * 60 * 60 * 1000; // 2 hours

    if (!isAuth || !authTime || Date.now() - parseInt(authTime) > SESSION_DURATION) {
      localStorage.removeItem('admin_authenticated');
      localStorage.removeItem('admin_auth_time');
      navigate('/admin');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_authenticated');
    localStorage.removeItem('admin_auth_time');
    toast.success('تم تسجيل الخروج');
    navigate('/admin');
  };

  // Fetch stats
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [ordersRes, restaurantsRes, productsRes] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact' }),
        supabase.from('sub_categories').select('*', { count: 'exact' }).eq('is_active', true),
        supabase.from('products').select('*', { count: 'exact' }).eq('is_active', true),
      ]);

      const orders = ordersRes.data || [];
      const todayOrders = orders.filter((o) => {
        const orderDate = new Date(o.created_at || '');
        const today = new Date();
        return orderDate.toDateString() === today.toDateString();
      });

      const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
      const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total_amount || 0), 0);

      return {
        totalOrders: ordersRes.count || 0,
        todayOrders: todayOrders.length,
        totalRestaurants: restaurantsRes.count || 0,
        totalProducts: productsRes.count || 0,
        totalRevenue,
        todayRevenue,
      };
    },
  });

  // Fetch orders with order numbers
  const { data: allOrders, isLoading: loadingOrders } = useQuery({
    queryKey: ['admin-all-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []).map((order, index) => ({
        ...order,
        orderNumber: index + 1,
      }));
    },
  });

  const recentOrders = allOrders?.slice().reverse().slice(0, 10);

  // Fetch restaurants
  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['admin-restaurants'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch products
  const { data: products, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*, sub_categories(name)')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Fetch cities
  const { data: cities, isLoading: loadingCities } = useQuery({
    queryKey: ['admin-cities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('allowed_cities')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  // Restaurant mutations
  const saveRestaurantMutation = useMutation({
    mutationFn: async (data: RestaurantForm) => {
      if (data.id) {
        const { error } = await supabase
          .from('sub_categories')
          .update({
            name: data.name,
            description: data.description,
            image_url: data.image_url,
            whatsapp_number: data.whatsapp_number,
            delivery_fee: data.delivery_fee,
            delivery_time_min: data.delivery_time_min,
            delivery_time_max: data.delivery_time_max,
            is_active: data.is_active,
            is_open: data.is_open,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('sub_categories').insert({
          name: data.name,
          description: data.description,
          image_url: data.image_url,
          whatsapp_number: data.whatsapp_number,
          delivery_fee: data.delivery_fee,
          delivery_time_min: data.delivery_time_min,
          delivery_time_max: data.delivery_time_max,
          is_active: data.is_active,
          is_open: data.is_open,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowRestaurantModal(false);
      toast.success(restaurantForm.id ? 'تم تحديث المطعم' : 'تم إضافة المطعم');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  const deleteRestaurantMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('sub_categories').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('تم حذف المطعم');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  // Product mutations
  const saveProductMutation = useMutation({
    mutationFn: async (data: ProductForm) => {
      const activeSizes = data.sizes_and_prices.filter(s => s.price > 0);
      if (data.id) {
        const { error } = await supabase
          .from('products')
          .update({
            name: data.name,
            description: data.description,
            price: data.price,
            image_url: data.image_url,
            sub_category_id: data.sub_category_id,
            is_active: data.is_active,
            sizes_and_prices: activeSizes,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert({
          name: data.name,
          description: data.description,
          price: data.price,
          image_url: data.image_url,
          sub_category_id: data.sub_category_id,
          is_active: data.is_active,
          sizes_and_prices: activeSizes,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      setShowProductModal(false);
      toast.success(productForm.id ? 'تم تحديث المنتج' : 'تم إضافة المنتج');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  const deleteProductMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('تم حذف المنتج');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  // City mutations
  const saveCityMutation = useMutation({
    mutationFn: async (data: CityForm) => {
      if (data.id) {
        const { error } = await supabase
          .from('allowed_cities')
          .update({
            name: data.name,
            delivery_price: data.delivery_price,
            is_active: data.is_active,
          })
          .eq('id', data.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('allowed_cities').insert({
          name: data.name,
          delivery_price: data.delivery_price,
          is_active: data.is_active,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      setShowCityModal(false);
      toast.success(cityForm.id ? 'تم تحديث المدينة' : 'تم إضافة المدينة');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  const deleteCityMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('allowed_cities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cities'] });
      toast.success('تم حذف المدينة');
    },
    onError: () => {
      toast.error('حدث خطأ');
    },
  });

  // Order status mutation
  const updateOrderStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase.from('orders').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-all-orders'] });
      toast.success('تم تحديث حالة الطلب');
    },
  });

  // Handlers
  const openRestaurantModal = (restaurant?: typeof restaurants[number]) => {
    if (restaurant) {
      setRestaurantForm({
        id: restaurant.id,
        name: restaurant.name,
        description: restaurant.description || '',
        image_url: restaurant.image_url || '',
        whatsapp_number: restaurant.whatsapp_number || '',
        delivery_fee: restaurant.delivery_fee || 10,
        delivery_time_min: restaurant.delivery_time_min || 30,
        delivery_time_max: restaurant.delivery_time_max || 45,
        is_active: restaurant.is_active ?? true,
        is_open: restaurant.is_open ?? true,
      });
    } else {
      setRestaurantForm({
        name: '',
        description: '',
        image_url: '',
        whatsapp_number: '',
        delivery_fee: 10,
        delivery_time_min: 30,
        delivery_time_max: 45,
        is_active: true,
        is_open: true,
      });
    }
    setShowRestaurantModal(true);
  };

  const openProductModal = (product?: typeof products[number]) => {
    if (product) {
      const existingSizes = Array.isArray(product.sizes_and_prices) 
        ? (product.sizes_and_prices as unknown as SizePrice[])
        : [];
      const mergedSizes = defaultSizes.map(ds => {
        const existing = existingSizes.find(es => es.name === ds.name);
        return existing || ds;
      });
      
      setProductForm({
        id: product.id,
        name: product.name,
        description: product.description || '',
        price: product.price,
        image_url: product.image_url || '',
        sub_category_id: product.sub_category_id || '',
        is_active: product.is_active ?? true,
        sizes_and_prices: mergedSizes,
      });
    } else {
      setProductForm({
        name: '',
        description: '',
        price: 0,
        image_url: '',
        sub_category_id: '',
        is_active: true,
        sizes_and_prices: [...defaultSizes],
      });
    }
    setShowProductModal(true);
  };

  const openCityModal = (city?: typeof cities[number]) => {
    if (city) {
      setCityForm({
        id: city.id,
        name: city.name,
        delivery_price: city.delivery_price || 10,
        is_active: city.is_active ?? true,
      });
    } else {
      setCityForm({
        name: '',
        delivery_price: 10,
        is_active: true,
      });
    }
    setShowCityModal(true);
  };

  const updateSizePrice = (index: number, price: number) => {
    const newSizes = [...productForm.sizes_and_prices];
    newSizes[index].price = price;
    setProductForm({ ...productForm, sizes_and_prices: newSizes });
  };

  const statCards = [
    { title: 'الطلبات اليوم', value: stats?.todayOrders || 0, icon: ClipboardList, color: 'bg-primary' },
    { title: 'إيرادات اليوم', value: `${stats?.todayRevenue || 0} ج.م`, icon: DollarSign, color: 'bg-green-500' },
    { title: 'إجمالي الطلبات', value: stats?.totalOrders || 0, icon: TrendingUp, color: 'bg-blue-500' },
    { title: 'المطاعم النشطة', value: stats?.totalRestaurants || 0, icon: Store, color: 'bg-orange-500' },
  ];

  const tabs = [
    { id: 'dashboard', label: 'لوحة التحكم', icon: LayoutDashboard },
    { id: 'restaurants', label: 'المطاعم', icon: Store },
    { id: 'products', label: 'المنتجات', icon: Package },
    { id: 'orders', label: 'الطلبات', icon: ClipboardList },
    { id: 'cities', label: 'المدن والتوصيل', icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b">
        <div className="container flex items-center justify-between h-16 px-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <span className="text-lg font-bold text-primary-foreground">ش</span>
            </div>
            <div>
              <h1 className="font-bold">لوحة التحكم</h1>
              <p className="text-xs text-muted-foreground">الشبح</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container p-4">
        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'outline'}
                onClick={() => setActiveTab(tab.id as ActiveTab)}
                className="whitespace-nowrap"
              >
                <Icon className="w-4 h-4 ml-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {loadingStats
                ? [...Array(4)].map((_, i) => (
                    <Skeleton key={i} className="h-24 rounded-2xl" />
                  ))
                : statCards.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <motion.div
                        key={stat.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-card rounded-2xl p-4 shadow-soft"
                      >
                        <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center mb-3`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <p className="text-2xl font-bold">{stat.value}</p>
                        <p className="text-sm text-muted-foreground">{stat.title}</p>
                      </motion.div>
                    );
                  })}
            </div>

            <div className="bg-card rounded-2xl p-4 shadow-soft">
              <h2 className="font-bold mb-4">آخر الطلبات</h2>
              {loadingOrders ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : recentOrders && recentOrders.length > 0 ? (
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-xl"
                    >
                      <div>
                        <p className="font-medium">
                          <span className="text-primary">#{order.orderNumber}</span> - {order.customer_name}
                        </p>
                        <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                      </div>
                      <div className="text-left">
                        <p className="font-bold text-primary">{order.total_amount} ج.م</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-600' :
                          order.status === 'confirmed' ? 'bg-blue-500/20 text-blue-600' :
                          'bg-green-500/20 text-green-600'
                        }`}>
                          {order.status === 'pending' && 'قيد الانتظار'}
                          {order.status === 'confirmed' && 'تم التأكيد'}
                          {order.status === 'delivered' && 'تم التوصيل'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
              )}
            </div>
          </>
        )}

        {/* Restaurants Tab */}
        {activeTab === 'restaurants' && (
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">المطاعم</h2>
              <Button onClick={() => openRestaurantModal()}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مطعم
              </Button>
            </div>
            {loadingRestaurants ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : restaurants && restaurants.length > 0 ? (
              <div className="space-y-3">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex items-center gap-4 p-3 bg-muted rounded-xl"
                  >
                    <img
                      src={restaurant.image_url || '/placeholder.svg'}
                      alt={restaurant.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-bold">{restaurant.name}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className={`w-2 h-2 rounded-full ${restaurant.is_open ? 'bg-green-500' : 'bg-red-500'}`} />
                        {restaurant.is_open ? 'مفتوح' : 'مغلق'}
                        <span className="mx-1">•</span>
                        توصيل: {restaurant.delivery_fee} ج.م
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" onClick={() => openRestaurantModal(restaurant)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => {
                          if (confirm('هل تريد حذف هذا المطعم؟')) {
                            deleteRestaurantMutation.mutate(restaurant.id);
                          }
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد مطاعم</p>
            )}
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">المنتجات</h2>
              <Button onClick={() => openProductModal()}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة منتج
              </Button>
            </div>
            {loadingProducts ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-20 rounded-xl" />
                ))}
              </div>
            ) : products && products.length > 0 ? (
              <div className="space-y-3">
                {products.map((product) => {
                  const sizes = Array.isArray(product.sizes_and_prices) 
                    ? (product.sizes_and_prices as unknown as SizePrice[]).filter(s => s.price > 0)
                    : [];
                  return (
                    <div
                      key={product.id}
                      className="flex items-center gap-4 p-3 bg-muted rounded-xl"
                    >
                      <img
                        src={product.image_url || '/placeholder.svg'}
                        alt={product.name}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-bold">{product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {product.sub_categories?.name || 'غير مصنف'}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {sizes.length > 0 ? (
                            sizes.slice(0, 3).map((size, i) => (
                              <span key={i} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                                {size.name}: {size.price} ج.م
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-primary font-bold">{product.price} ج.م</span>
                          )}
                          {sizes.length > 3 && (
                            <span className="text-xs text-muted-foreground">+{sizes.length - 3}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openProductModal(product)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('هل تريد حذف هذا المنتج؟')) {
                              deleteProductMutation.mutate(product.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد منتجات</p>
            )}
          </div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <h2 className="font-bold mb-4">جميع الطلبات</h2>
            {loadingOrders ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </div>
            ) : allOrders && allOrders.length > 0 ? (
              <div className="space-y-3">
                {allOrders.slice().reverse().map((order) => {
                  const items = order.items as { name: string; quantity: number; size?: string }[];
                  return (
                    <div key={order.id} className="p-4 bg-muted rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-bold">
                          <span className="text-primary text-lg">#{order.orderNumber}</span>
                          <span className="mx-2">-</span>
                          {order.customer_name}
                        </p>
                        <Select
                          value={order.status || 'pending'}
                          onValueChange={(status) => updateOrderStatusMutation.mutate({ id: order.id, status })}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">قيد الانتظار</SelectItem>
                            <SelectItem value="confirmed">تم التأكيد</SelectItem>
                            <SelectItem value="delivered">تم التوصيل</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{order.customer_phone}</p>
                      <p className="text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3 inline ml-1" />
                        {order.customer_city}
                      </p>
                      <div className="text-sm mb-2">
                        {items?.map((item, i) => (
                          <span key={i}>
                            {item.name} {item.size && `(${item.size})`} × {item.quantity}
                            {i < items.length - 1 && '، '}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-primary">{order.total_amount} ج.م</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at || '').toLocaleString('ar-EG')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد طلبات</p>
            )}
          </div>
        )}

        {/* Cities Tab */}
        {activeTab === 'cities' && (
          <div className="bg-card rounded-2xl p-4 shadow-soft">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold">المدن وأسعار التوصيل</h2>
              <Button onClick={() => openCityModal()}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة مدينة
              </Button>
            </div>
            {loadingCities ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-xl" />
                ))}
              </div>
            ) : cities && cities.length > 0 ? (
              <div className="space-y-3">
                {cities.map((city) => (
                  <div
                    key={city.id}
                    className="flex items-center justify-between p-3 bg-muted rounded-xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${city.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                      <span className="font-bold">{city.name}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-primary font-bold">{city.delivery_price} ج.م</span>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="icon" onClick={() => openCityModal(city)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('هل تريد حذف هذه المدينة؟')) {
                              deleteCityMutation.mutate(city.id);
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">لا توجد مدن</p>
            )}
          </div>
        )}
      </div>

      {/* Restaurant Modal */}
      <Dialog open={showRestaurantModal} onOpenChange={setShowRestaurantModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{restaurantForm.id ? 'تعديل المطعم' : 'إضافة مطعم جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="اسم المطعم *"
              value={restaurantForm.name}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, name: e.target.value })}
            />
            <Textarea
              placeholder="وصف المطعم"
              value={restaurantForm.description}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, description: e.target.value })}
            />
            <Input
              placeholder="رابط الصورة"
              value={restaurantForm.image_url}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, image_url: e.target.value })}
            />
            <Input
              placeholder="رقم الواتساب"
              value={restaurantForm.whatsapp_number}
              onChange={(e) => setRestaurantForm({ ...restaurantForm, whatsapp_number: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                placeholder="رسوم التوصيل"
                value={restaurantForm.delivery_fee}
                onChange={(e) => setRestaurantForm({ ...restaurantForm, delivery_fee: Number(e.target.value) })}
              />
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="وقت التوصيل من"
                  value={restaurantForm.delivery_time_min}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, delivery_time_min: Number(e.target.value) })}
                />
                <Input
                  type="number"
                  placeholder="إلى"
                  value={restaurantForm.delivery_time_max}
                  onChange={(e) => setRestaurantForm({ ...restaurantForm, delivery_time_max: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span>المطعم نشط</span>
              <Switch
                checked={restaurantForm.is_active}
                onCheckedChange={(checked) => setRestaurantForm({ ...restaurantForm, is_active: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <span>المطعم مفتوح</span>
              <Switch
                checked={restaurantForm.is_open}
                onCheckedChange={(checked) => setRestaurantForm({ ...restaurantForm, is_open: checked })}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveRestaurantMutation.mutate(restaurantForm)}
              disabled={!restaurantForm.name || saveRestaurantMutation.isPending}
            >
              <Save className="w-4 h-4 ml-2" />
              {saveRestaurantMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Product Modal */}
      <Dialog open={showProductModal} onOpenChange={setShowProductModal}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{productForm.id ? 'تعديل المنتج' : 'إضافة منتج جديد'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="اسم المنتج *"
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
            />
            <Textarea
              placeholder="وصف المنتج"
              value={productForm.description}
              onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
            />
            <Input
              placeholder="رابط الصورة"
              value={productForm.image_url}
              onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
            />
            <Select
              value={productForm.sub_category_id}
              onValueChange={(value) => setProductForm({ ...productForm, sub_category_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر المطعم *" />
              </SelectTrigger>
              <SelectContent>
                {restaurants?.map((r) => (
                  <SelectItem key={r.id} value={r.id}>{r.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="السعر الأساسي (إذا لم يكن له أحجام)"
              value={productForm.price}
              onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
            />
            
            {/* Sizes Section */}
            <div className="border rounded-lg p-3">
              <div className="flex items-center gap-2 mb-3">
                <Ruler className="w-4 h-4" />
                <span className="font-bold">الأحجام والأسعار</span>
                <span className="text-xs text-muted-foreground">(اترك السعر 0 للإخفاء)</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {productForm.sizes_and_prices.map((size, index) => (
                  <div key={size.name} className="flex items-center gap-2">
                    <span className="text-sm w-20">{size.name}</span>
                    <Input
                      type="number"
                      placeholder="السعر"
                      value={size.price || ''}
                      onChange={(e) => updateSizePrice(index, Number(e.target.value))}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span>المنتج نشط</span>
              <Switch
                checked={productForm.is_active}
                onCheckedChange={(checked) => setProductForm({ ...productForm, is_active: checked })}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveProductMutation.mutate(productForm)}
              disabled={!productForm.name || !productForm.sub_category_id || saveProductMutation.isPending}
            >
              <Save className="w-4 h-4 ml-2" />
              {saveProductMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* City Modal */}
      <Dialog open={showCityModal} onOpenChange={setShowCityModal}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{cityForm.id ? 'تعديل المدينة' : 'إضافة مدينة جديدة'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="اسم المدينة *"
              value={cityForm.name}
              onChange={(e) => setCityForm({ ...cityForm, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="سعر التوصيل"
              value={cityForm.delivery_price}
              onChange={(e) => setCityForm({ ...cityForm, delivery_price: Number(e.target.value) })}
            />
            <div className="flex items-center justify-between">
              <span>المدينة نشطة</span>
              <Switch
                checked={cityForm.is_active}
                onCheckedChange={(checked) => setCityForm({ ...cityForm, is_active: checked })}
              />
            </div>
            <Button 
              className="w-full" 
              onClick={() => saveCityMutation.mutate(cityForm)}
              disabled={!cityForm.name || saveCityMutation.isPending}
            >
              <Save className="w-4 h-4 ml-2" />
              {saveCityMutation.isPending ? 'جاري الحفظ...' : 'حفظ'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;