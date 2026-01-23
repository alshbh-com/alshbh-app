import { useState, useEffect, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronLeft, Sparkles, Navigation, Store, Truck, Info } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load 3D components for better performance
const DistrictMap3D = lazy(() => import('@/components/3d/DistrictMap3D'));
const VillageOrbit3D = lazy(() => import('@/components/3d/VillageOrbit3D'));

interface District {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  default_delivery_fee: number | null;
}

interface Village {
  id: string;
  name: string;
  delivery_fee: number;
  district_id: string | null;
}

const fetchDistricts = async (): Promise<District[]> => {
  const { data, error } = await supabase
    .from('districts')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

const fetchVillages = async (districtId: string): Promise<Village[]> => {
  const { data, error } = await supabase
    .from('villages')
    .select('*')
    .eq('district_id', districtId)
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  return data || [];
};

// 3D Loading fallback
const Map3DFallback = () => (
  <div className="w-full h-[400px] md:h-[500px] rounded-2xl bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
    <div className="text-center space-y-4">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 mx-auto rounded-full border-4 border-primary border-t-transparent"
      />
      <p className="text-white/70">جاري تحميل الخريطة...</p>
    </div>
  </div>
);

const DistrictSelection = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);
  const [forceShow, setForceShow] = useState(false);

  // Check if coming from change location action
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('change') === 'true') {
      localStorage.removeItem('alshbh_selected_location');
      setForceShow(true);
    }
  }, []);

  // Check if location is already saved (only redirect if not forcing show)
  useEffect(() => {
    if (!forceShow) {
      const savedLocation = localStorage.getItem('alshbh_selected_location');
      if (savedLocation) {
        navigate('/home');
      }
    }
  }, [navigate, forceShow]);

  const { data: districts, isLoading: loadingDistricts } = useQuery({
    queryKey: ['districts'],
    queryFn: fetchDistricts,
  });

  const { data: villages, isLoading: loadingVillages } = useQuery({
    queryKey: ['villages', selectedDistrict?.id],
    queryFn: () => fetchVillages(selectedDistrict!.id),
    enabled: !!selectedDistrict,
  });

  const handleDistrictSelect = (district: District) => {
    setSelectedDistrict(district);
    setSelectedVillage(null);
  };

  const handleVillageSelect = (village: Village) => {
    setSelectedVillage(village);
  };

  const handleConfirm = () => {
    if (selectedDistrict && selectedVillage) {
      const locationData = {
        districtId: selectedDistrict.id,
        districtName: selectedDistrict.name,
        villageId: selectedVillage.id,
        villageName: selectedVillage.name,
        deliveryFee: selectedVillage.delivery_fee,
      };
      localStorage.setItem('alshbh_selected_location', JSON.stringify(locationData));
      navigate('/home');
    }
  };

  const handleBack = () => {
    setSelectedDistrict(null);
    setSelectedVillage(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="container py-4 px-4">
          <div className="flex items-center justify-between">
            {selectedDistrict && (
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
            )}
            <div className="flex items-center gap-2 mx-auto">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow">
                <span className="text-xl">👻</span>
              </div>
              <h1 className="text-xl font-bold neon-text text-primary">
                الشبح
              </h1>
            </div>
            {selectedDistrict && <div className="w-10" />}
          </div>
        </div>
      </header>

      <main className="container py-6 px-4">
        <AnimatePresence mode="wait">
          {!selectedDistrict ? (
            // Step 1: Select District with 3D Map
            <motion.div
              key="districts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* Hero Section */}
              <div className="text-center space-y-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center neon-glow"
                >
                  <MapPin className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold">🏰 اختر مركزك</h2>
                <p className="text-muted-foreground text-sm">
                  اضغط على المركز في الخريطة لاختياره
                </p>
              </div>

              {/* 3D Map */}
              {loadingDistricts ? (
                <Map3DFallback />
              ) : districts && districts.length > 0 ? (
                <Suspense fallback={<Map3DFallback />}>
                  <DistrictMap3D
                    districts={districts}
                    onDistrictSelect={handleDistrictSelect}
                    selectedDistrictId={undefined}
                  />
                </Suspense>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🏘️</div>
                  <h3 className="text-xl font-bold mb-2">لا توجد مناطق حالياً</h3>
                  <p className="text-muted-foreground">سيتم إضافة المناطق قريباً</p>
                </motion.div>
              )}

              {/* Districts Grid for accessibility/fallback */}
              {districts && districts.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground text-center">
                    أو اختر من القائمة:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {districts.map((district, index) => (
                      <motion.button
                        key={district.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => handleDistrictSelect(district)}
                        className="group p-4 rounded-xl bg-card border border-border/50 hover:border-primary/50 hover:neon-glow transition-all text-right"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <Navigation className="w-5 h-5 text-primary-foreground" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold truncate">{district.name}</p>
                            {district.default_delivery_fee && (
                              <p className="text-xs text-primary">
                                من {district.default_delivery_fee} ج.م
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <Truck className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-bold text-sm">توصيل سريع لجميع المناطق</p>
                  <p className="text-xs text-muted-foreground">
                    سيارات توصيل متاحة على مدار الساعة
                  </p>
                </div>
              </motion.div>
            </motion.div>
          ) : (
            // Step 2: Select Village with 3D Orbit
            <motion.div
              key="villages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {/* District Info */}
              <div className="text-center space-y-2">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center neon-glow"
                >
                  <Navigation className="w-8 h-8 text-primary-foreground" />
                </motion.div>
                <h2 className="text-xl font-bold">{selectedDistrict.name}</h2>
                <p className="text-muted-foreground text-sm">
                  🌙 اختر قريتك من الأقمار الدوارة
                </p>
              </div>

              {/* 3D Village Orbit */}
              {loadingVillages ? (
                <Map3DFallback />
              ) : villages && villages.length > 0 ? (
                <>
                  <Suspense fallback={<Map3DFallback />}>
                    <VillageOrbit3D
                      districtName={selectedDistrict.name}
                      villages={villages}
                      onVillageSelect={handleVillageSelect}
                      selectedVillageId={selectedVillage?.id}
                    />
                  </Suspense>

                  {/* Village selection list */}
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground text-center">
                      أو اختر من القائمة:
                    </p>
                    <div className="grid grid-cols-1 gap-2 max-h-[200px] overflow-y-auto scrollbar-hide">
                      {villages.map((village) => (
                        <motion.button
                          key={village.id}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleVillageSelect(village)}
                          className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                            selectedVillage?.id === village.id
                              ? 'bg-primary/20 border-primary neon-glow'
                              : 'bg-card border-border/50 hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              selectedVillage?.id === village.id
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}>
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <span className="font-medium">{village.name}</span>
                          </div>
                          <span className={`text-sm font-bold ${
                            village.delivery_fee <= 20 ? 'text-green-500' :
                            village.delivery_fee <= 40 ? 'text-yellow-500' : 'text-primary'
                          }`}>
                            {village.delivery_fee} ج.م
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Selected Village Info */}
                  <AnimatePresence>
                    {selectedVillage && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 rounded-xl bg-gradient-to-r from-primary/20 to-accent/20 border border-primary/30 space-y-3">
                          <div className="flex items-center gap-2">
                            <Info className="w-5 h-5 text-primary" />
                            <span className="font-bold">تفاصيل التوصيل</span>
                          </div>
                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                              <p className="text-muted-foreground">المركز</p>
                              <p className="font-bold">{selectedDistrict.name}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">القرية</p>
                              <p className="font-bold">{selectedVillage.name}</p>
                            </div>
                            <div className="col-span-2">
                              <p className="text-muted-foreground">رسوم التوصيل</p>
                              <p className="font-bold text-2xl text-primary neon-text">
                                {selectedVillage.delivery_fee} ج.م
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Confirm Button */}
                  <Button
                    onClick={handleConfirm}
                    disabled={!selectedVillage}
                    className="w-full h-14 rounded-xl text-lg font-bold neon-glow"
                    size="lg"
                  >
                    ✨ تأكيد الموقع والمتابعة
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">لا توجد قرى مضافة لهذا المركز</p>
                  <Button variant="outline" onClick={handleBack} className="mt-4">
                    العودة لاختيار مركز آخر
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default DistrictSelection;
