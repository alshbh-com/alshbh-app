import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MapPin, ChevronLeft, Store, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { DistrictMap3D } from '@/components/3d/DistrictMap3D';
import { RestaurantStorefront3D } from '@/components/3d/RestaurantStorefront3D';
import { FloatingCart3D, FloatingCartButton } from '@/components/3d/FloatingCart3D';
import { AppLayout } from '@/components/layout/AppLayout';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface District {
  id: string;
  name: string;
  name_en?: string;
  description?: string;
  image_url?: string;
  default_delivery_fee: number;
  is_active: boolean;
  latitude?: number;
  longitude?: number;
}

interface Village {
  id: string;
  district_id: string;
  name: string;
  name_en?: string;
  delivery_fee: number;
  is_active: boolean;
}

interface Restaurant {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  is_active: boolean;
  is_open: boolean;
  average_rating: number;
  district_id?: string;
  whatsapp_number?: string;
}

// Session storage for selected location
const LOCATION_KEY = 'alshbh_selected_location';

export function DistrictSelectionPage() {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [showVillageModal, setShowVillageModal] = useState(false);
  const [showRestaurants, setShowRestaurants] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  // Load saved location
  useEffect(() => {
    const saved = localStorage.getItem(LOCATION_KEY);
    if (saved) {
      try {
        const location = JSON.parse(saved);
        setSelectedVillage(location.village);
        setSelectedDistrict(location.district);
      } catch (e) {
        console.error('Failed to parse saved location');
      }
    }
  }, []);

  // Fetch districts
  const { data: districts, isLoading: loadingDistricts } = useQuery({
    queryKey: ['districts'],
    queryFn: async () => {
      const { data: districtData, error } = await supabase
        .from('districts')
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      // Get restaurant counts
      const { data: restaurants } = await supabase
        .from('sub_categories')
        .select('district_id')
        .eq('is_active', true);
      
      const counts: Record<string, number> = {};
      restaurants?.forEach((r) => {
        if (r.district_id) {
          counts[r.district_id] = (counts[r.district_id] || 0) + 1;
        }
      });
      
      return (districtData || []).map((d, index) => ({
        ...d,
        restaurants_count: counts[d.id] || 0,
        // Position in 3D space (circular arrangement)
        position: [
          Math.cos((index / (districtData?.length || 1)) * Math.PI * 2) * 8,
          0,
          Math.sin((index / (districtData?.length || 1)) * Math.PI * 2) * 8
        ] as [number, number, number],
        color: ['#f97316', '#22c55e', '#6366f1', '#ec4899', '#fbbf24'][index % 5]
      }));
    },
  });

  // Fetch villages for selected district
  const { data: villages, isLoading: loadingVillages } = useQuery({
    queryKey: ['villages', selectedDistrict?.id],
    queryFn: async () => {
      if (!selectedDistrict) return [];
      const { data, error } = await supabase
        .from('villages')
        .select('*')
        .eq('district_id', selectedDistrict.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      
      return (data || []).map((v, index) => ({
        ...v,
        position: [
          Math.cos((index / (data?.length || 1)) * Math.PI * 2) * 5,
          1,
          Math.sin((index / (data?.length || 1)) * Math.PI * 2) * 5
        ] as [number, number, number]
      }));
    },
    enabled: !!selectedDistrict,
  });

  // Fetch restaurants for selected district
  const { data: restaurants, isLoading: loadingRestaurants } = useQuery({
    queryKey: ['district-restaurants', selectedDistrict?.id],
    queryFn: async () => {
      if (!selectedDistrict) return [];
      const { data, error } = await supabase
        .from('sub_categories')
        .select('*')
        .eq('district_id', selectedDistrict.id)
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!selectedDistrict && showRestaurants,
  });

  const handleSelectDistrict = (district: District) => {
    setSelectedDistrict(district);
    setShowVillageModal(true);
  };

  const handleSelectVillage = (village: Village) => {
    setSelectedVillage(village);
    // Save to localStorage
    localStorage.setItem(LOCATION_KEY, JSON.stringify({
      district: selectedDistrict,
      village: village
    }));
    setShowVillageModal(false);
    setShowRestaurants(true);
    toast.success(`تم اختيار ${village.name} - التوصيل: ${village.delivery_fee} ج.م`);
  };

  const handleSelectRestaurant = (restaurant: Restaurant) => {
    navigate(`/restaurant/${restaurant.id}`);
  };

  const handleChangeVillage = () => {
    setShowVillageModal(true);
  };

  const handleBackToDistricts = () => {
    setSelectedDistrict(null);
    setShowRestaurants(false);
    setSelectedVillage(null);
    localStorage.removeItem(LOCATION_KEY);
  };

  // If we have a saved location, show restaurants directly
  if (selectedVillage && !showVillageModal) {
    return (
      <AppLayout showSearch={false}>
        <div className="container py-4 px-4">
          {/* Location header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBackToDistricts}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div>
                <p className="text-sm text-muted-foreground">التوصيل إلى</p>
                <p className="font-bold flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-primary" />
                  {selectedVillage.name}
                  <span className="text-primary text-sm">({selectedVillage.delivery_fee} ج.م)</span>
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleChangeVillage}>
              تغيير
            </Button>
          </motion.div>

          {/* District restaurants */}
          {selectedDistrict && (
            <>
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold mb-4"
              >
                مطاعم {selectedDistrict.name}
              </motion.h2>

              {loadingRestaurants ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-48 rounded-2xl" />
                  ))}
                </div>
              ) : restaurants && restaurants.length > 0 ? (
                <RestaurantStorefront3D
                  restaurants={restaurants.map((r) => ({
                    id: r.id,
                    name: r.name,
                    image_url: r.image_url || undefined,
                    rating: r.average_rating || 4.5,
                    is_open: r.is_open ?? true
                  }))}
                  onSelectRestaurant={(r) => navigate(`/restaurant/${r.id}`)}
                />
              ) : (
                <div className="text-center py-12 bg-card rounded-2xl">
                  <Store className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                  <p className="text-xl font-bold mb-2">لا توجد مطاعم حالياً</p>
                  <p className="text-muted-foreground">سيتم إضافة مطاعم قريباً في هذا المركز</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Floating cart */}
        <FloatingCartButton onClick={() => setCartOpen(true)} />
        <FloatingCart3D
          isOpen={cartOpen}
          onClose={() => setCartOpen(false)}
          selectedVillage={selectedVillage}
          onChangeVillage={handleChangeVillage}
        />

        {/* Village selection modal */}
        <VillageSelectionModal
          isOpen={showVillageModal}
          onClose={() => setShowVillageModal(false)}
          district={selectedDistrict}
          villages={villages || []}
          loading={loadingVillages}
          onSelectVillage={handleSelectVillage}
        />
      </AppLayout>
    );
  }

  // Main district selection view
  return (
    <AppLayout showSearch={false}>
      <div className="container py-4 px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold mb-2">
            <span className="text-gradient">الشبح</span> - طلب طعام
          </h1>
          <p className="text-muted-foreground">اختر مركزك للبدء</p>
        </motion.div>

        {/* 3D Map */}
        {loadingDistricts ? (
          <Skeleton className="h-[70vh] rounded-3xl" />
        ) : districts && districts.length > 0 ? (
          <DistrictMap3D
            districts={districts}
            selectedDistrict={selectedDistrict}
            villages={(villages || []).map((v, i) => ({
              ...v,
              position: [
                Math.cos((i / (villages?.length || 1)) * Math.PI * 2) * 5,
                1,
                Math.sin((i / (villages?.length || 1)) * Math.PI * 2) * 5
              ] as [number, number, number]
            }))}
            onSelectDistrict={handleSelectDistrict}
            onSelectVillage={handleSelectVillage}
          />
        ) : (
          <div className="text-center py-20 bg-card rounded-3xl">
            <MapPin className="w-20 h-20 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-bold mb-2">لا توجد مراكز حالياً</h2>
            <p className="text-muted-foreground mb-4">
              يمكنك إضافة المراكز من لوحة الأدمن
            </p>
            <Button onClick={() => navigate('/admin')}>
              لوحة الأدمن
            </Button>
          </div>
        )}

        {/* Village selection modal */}
        <VillageSelectionModal
          isOpen={showVillageModal}
          onClose={() => setShowVillageModal(false)}
          district={selectedDistrict}
          villages={villages || []}
          loading={loadingVillages}
          onSelectVillage={handleSelectVillage}
        />
      </div>
    </AppLayout>
  );
}

// Village Selection Modal Component
function VillageSelectionModal({
  isOpen,
  onClose,
  district,
  villages,
  loading,
  onSelectVillage
}: {
  isOpen: boolean;
  onClose: () => void;
  district: District | null;
  villages: Village[];
  loading: boolean;
  onSelectVillage: (village: Village) => void;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed inset-x-4 top-1/2 -translate-y-1/2 z-50 max-w-lg mx-auto bg-card rounded-3xl shadow-elevated overflow-hidden"
            style={{
              boxShadow: '0 0 50px hsl(var(--primary) / 0.3)'
            }}
          >
            {/* Neon border */}
            <div className="absolute inset-0 rounded-3xl border-2 border-primary/50 pointer-events-none" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">
                  اختر قريتك في {district?.name}
                </h2>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              <p className="text-muted-foreground mb-4">
                رسوم التوصيل تختلف حسب المنطقة
              </p>

              {loading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 rounded-xl" />
                  ))}
                </div>
              ) : villages.length > 0 ? (
                <div className="space-y-3 max-h-[50vh] overflow-y-auto">
                  {villages.map((village) => (
                    <motion.button
                      key={village.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => onSelectVillage(village)}
                      className="w-full p-4 bg-muted rounded-xl text-right flex items-center justify-between hover:bg-primary/10 hover:border-primary transition-colors border border-transparent"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <span className="font-bold">{village.name}</span>
                      </div>
                      <div className="text-left">
                        <span className="text-lg font-bold text-primary">
                          {village.delivery_fee} ج.م
                        </span>
                        <p className="text-xs text-muted-foreground">رسوم التوصيل</p>
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد قرى مضافة لهذا المركز</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default DistrictSelectionPage;
