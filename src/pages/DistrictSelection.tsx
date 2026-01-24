import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ChevronLeft, Sparkles, Navigation, Store, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface District {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  default_delivery_fee: number | null;
  whatsapp_number: string | null;
  villages_count?: number;
}

interface Village {
  id: string;
  name: string;
  delivery_fee: number;
  district_id: string | null;
}

const fetchDistricts = async (): Promise<District[]> => {
  // Fetch districts with village count
  const { data, error } = await supabase
    .from('districts')
    .select('*, villages(id)')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw error;
  
  // Add villages count to each district
  return (data || []).map((d: any) => ({
    ...d,
    villages_count: d.villages?.length || 0,
  }));
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

const DistrictSelection = () => {
  const navigate = useNavigate();
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);
  const [selectedVillage, setSelectedVillage] = useState<Village | null>(null);

  // Check if location is already saved
  useEffect(() => {
    const savedLocation = localStorage.getItem('alshbh_selected_location');
    if (savedLocation) {
      navigate('/home');
    }
  }, [navigate]);

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

  const handleVillageSelect = (villageId: string) => {
    const village = villages?.find((v) => v.id === villageId);
    if (village) {
      setSelectedVillage(village);
    }
  };

  const handleConfirm = () => {
    if (selectedDistrict && selectedVillage) {
      const locationData = {
        district: {
          id: selectedDistrict.id,
          name: selectedDistrict.name,
          whatsappNumber: selectedDistrict.whatsapp_number,
        },
        village: {
          id: selectedVillage.id,
          name: selectedVillage.name,
          deliveryFee: selectedVillage.delivery_fee,
        },
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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <span className="text-xl">👻</span>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                الشبح فود
              </h1>
            </div>
            {selectedDistrict && <div className="w-10" />}
          </div>
        </div>
      </header>

      <main className="container py-8 px-4">
        <AnimatePresence mode="wait">
          {!selectedDistrict ? (
            // Step 1: Select District
            <motion.div
              key="districts"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* Hero Section */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center"
                >
                  <MapPin className="w-12 h-12 text-primary" />
                </motion.div>
                <h2 className="text-2xl font-bold">اختر مركزك</h2>
                <p className="text-muted-foreground">
                  حدد موقعك لعرض المطاعم المتاحة في منطقتك
                </p>
              </div>

              {/* Districts Grid */}
              {loadingDistricts ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-40 rounded-2xl" />
                  ))}
                </div>
              ) : districts && districts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {districts.map((district, index) => (
                    <motion.button
                      key={district.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleDistrictSelect(district)}
                      className="group relative overflow-hidden rounded-2xl bg-card border border-border/50 p-6 text-right hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                    >
                      {/* Background Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      {/* Sparkle Effect */}
                      <motion.div
                        className="absolute top-4 left-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                      >
                        <Sparkles className="w-5 h-5 text-primary/30 group-hover:text-primary transition-colors" />
                      </motion.div>

                      <div className="relative space-y-3">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <Navigation className="w-7 h-7 text-primary-foreground" />
                        </div>
                        <h3 className="text-lg font-bold">{district.name}</h3>
                        {district.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {district.description}
                          </p>
                        )}
                        {/* Villages count badge */}
                        {district.villages_count && district.villages_count > 0 && (
                          <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-accent/50 text-xs text-accent-foreground">
                            <MapPin className="w-3 h-3" />
                            <span>{district.villages_count} قرية</span>
                          </div>
                        )}
                        {district.default_delivery_fee && (
                          <div className="flex items-center gap-2 text-sm text-primary font-medium">
                            <Store className="w-4 h-4" />
                            <span>التوصيل من {district.default_delivery_fee} ج.م</span>
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="text-6xl mb-4">🏘️</div>
                  <h3 className="text-xl font-bold mb-2">لا توجد مناطق حالياً</h3>
                  <p className="text-muted-foreground">
                    سيتم إضافة المناطق قريباً
                  </p>
                </motion.div>
              )}
            </motion.div>
          ) : (
            // Step 2: Select Village
            <motion.div
              key="villages"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-lg mx-auto space-y-8"
            >
              {/* Selected District Info */}
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', duration: 0.6 }}
                  className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                >
                  <Navigation className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedDistrict.name}</h2>
                  <p className="text-muted-foreground">اختر قريتك أو منطقتك</p>
                </div>
              </div>

              {/* Village Selection */}
              <div className="space-y-4">
                {loadingVillages ? (
                  <Skeleton className="h-14 rounded-xl" />
                ) : villages && villages.length > 0 ? (
                  <>
                    <Select onValueChange={handleVillageSelect}>
                      <SelectTrigger className="h-14 rounded-xl text-base">
                        <SelectValue placeholder="اختر القرية / المنطقة" />
                      </SelectTrigger>
                      <SelectContent>
                        {villages.map((village) => (
                          <SelectItem key={village.id} value={village.id}>
                            <div className="flex items-center justify-between w-full gap-4">
                              <span>{village.name}</span>
                              <span className="text-primary font-medium">
                                توصيل: {village.delivery_fee} ج.م
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {/* Selected Village Info */}
                    <AnimatePresence>
                      {selectedVillage && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">المنطقة</span>
                              <span className="font-bold">{selectedVillage.name}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">رسوم التوصيل</span>
                              <span className="font-bold text-primary">
                                {selectedVillage.delivery_fee} ج.م
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Confirm Button */}
                    <Button
                      onClick={handleConfirm}
                      disabled={!selectedVillage}
                      className="w-full h-14 rounded-xl text-lg font-bold"
                      size="lg"
                    >
                      تأكيد الموقع والمتابعة
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      لا توجد قرى مضافة لهذا المركز
                    </p>
                    <Button
                      variant="outline"
                      onClick={handleBack}
                      className="mt-4"
                    >
                      العودة لاختيار مركز آخر
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Decorative Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default DistrictSelection;
