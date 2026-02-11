import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Home, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderNumber = location.state?.orderNumber || '';

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4" dir="rtl">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.6 }}
        className="text-center max-w-md w-full"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6"
        >
          <CheckCircle className="w-14 h-14 text-green-500" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-2xl font-bold mb-2"
        >
          شكراً لك! 🎉
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-muted-foreground mb-2"
        >
          تم استلام طلبك بنجاح
        </motion.p>

        {orderNumber && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-primary/10 rounded-xl py-3 px-6 inline-block mb-6"
          >
            <p className="text-sm text-muted-foreground">رقم الطلب</p>
            <p className="text-2xl font-bold text-primary">#{orderNumber}</p>
          </motion.div>
        )}

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-muted-foreground text-sm mb-8"
        >
          سيتم التواصل معك قريباً لتأكيد الطلب
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-3"
        >
          <Button onClick={() => navigate('/orders')} className="w-full h-12 rounded-xl gap-2">
            <FileText className="w-5 h-5" />
            تتبع طلباتي
          </Button>
          <Button variant="outline" onClick={() => navigate('/home')} className="w-full h-12 rounded-xl gap-2">
            <Home className="w-5 h-5" />
            العودة للرئيسية
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default OrderSuccess;
