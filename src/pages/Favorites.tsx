import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Favorites = () => {
  // TODO: Implement favorites with Supabase
  const favorites: any[] = [];

  return (
    <AppLayout>
      <div className="container py-6 px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold mb-6"
        >
          المفضلة
        </motion.h1>

        {favorites.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Heart className="w-12 h-12 text-muted-foreground" />
            </div>
            <h2 className="text-xl font-bold mb-2">لا توجد مفضلات</h2>
            <p className="text-muted-foreground mb-6">
              أضف مطاعمك ووجباتك المفضلة هنا
            </p>
            <Link to="/">
              <Button size="lg">تصفح المطاعم</Button>
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Favorites will be displayed here */}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Favorites;