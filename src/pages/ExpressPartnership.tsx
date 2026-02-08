import { AppLayout } from '@/components/layout/AppLayout';
import { motion } from 'framer-motion';
import { Truck, Clock, Shield, Star, MapPin, Phone, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Truck,
    title: 'توصيل سريع وموثوق',
    description: 'فريق توصيل محترف يضمن وصول طلبك بأفضل حالة وفي أسرع وقت ممكن.',
  },
  {
    icon: Clock,
    title: 'متاح على مدار الساعة',
    description: 'خدمة التوصيل متوفرة طوال ساعات العمل لتلبية جميع احتياجاتك.',
  },
  {
    icon: Shield,
    title: 'أمان وضمان',
    description: 'طلبك مؤمّن بالكامل من لحظة الاستلام حتى التسليم مع ضمان الجودة.',
  },
  {
    icon: MapPin,
    title: 'تغطية واسعة',
    description: 'نغطي جميع المناطق والقرى في نطاق الخدمة بأسعار مناسبة.',
  },
];

const stats = [
  { value: '+5000', label: 'طلب تم توصيله' },
  { value: '98%', label: 'نسبة رضا العملاء' },
  { value: '25', label: 'دقيقة متوسط التوصيل' },
  { value: '24/7', label: 'دعم فني متواصل' },
];

const ExpressPartnership = () => {
  return (
    <AppLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-red-600 via-red-500 to-orange-500 text-white">
        {/* Animated background patterns */}
        <motion.div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)',
            backgroundSize: '30px 30px',
          }}
          animate={{ x: [0, 30], y: [0, -30] }}
          transition={{ duration: 10, repeat: Infinity, repeatType: 'reverse' }}
        />

        <div className="container relative z-10 px-4 py-12 text-center">
          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="mx-auto mb-6"
          >
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-white/30 rounded-3xl blur-xl scale-150" />
              <img
                src="/images/express-go.png"
                alt="Express Go"
                className="relative w-28 h-28 rounded-3xl object-cover border-4 border-white/50 shadow-2xl"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <span className="text-yellow-200 text-sm font-bold tracking-wider uppercase">شراكة رسمية</span>
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black mb-3 drop-shadow-lg">
              Express Go × منصتنا
            </h1>
            <p className="text-white/90 text-lg max-w-md mx-auto leading-relaxed">
              شراكة استراتيجية لتقديم أفضل تجربة توصيل سريعة وموثوقة لعملائنا الكرام
            </p>
          </motion.div>
        </div>

        {/* Wave separator */}
        <svg className="block w-full" viewBox="0 0 1440 60" preserveAspectRatio="none">
          <path d="M0,60 C360,0 720,0 1440,60 L1440,60 L0,60 Z" className="fill-background" />
        </svg>
      </section>

      {/* Stats Section */}
      <section className="py-8 px-4 -mt-2">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-card rounded-2xl p-4 text-center border shadow-sm"
              >
                <div className="text-2xl font-black text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold mb-6 text-center"
          >
            ليه Express Go؟
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 * i }}
                className="bg-card rounded-2xl p-5 border shadow-sm flex gap-4 items-start"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits List */}
      <section className="py-8 px-4">
        <div className="container">
          <div className="bg-gradient-to-bl from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/20 rounded-2xl p-6 border border-red-100 dark:border-red-900/30">
            <h2 className="text-lg font-bold mb-4 text-center">مميزات الشراكة</h2>
            <div className="space-y-3">
              {[
                'أسعار توصيل مخفضة حصرياً لعملاء المنصة',
                'تتبع الطلب لحظة بلحظة',
                'فريق دعم مخصص للمنصة',
                'ضمان التوصيل في الوقت المحدد',
                'تعويض فوري في حالة أي مشكلة',
                'خدمة عملاء على مدار الساعة',
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-sm font-medium">{item}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 px-4 pb-12">
        <div className="container text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-6 border shadow-sm"
          >
            <Phone className="w-10 h-10 mx-auto mb-3 text-primary" />
            <h2 className="text-lg font-bold mb-2">تواصل معنا</h2>
            <p className="text-sm text-muted-foreground mb-4">
              لأي استفسار عن خدمة التوصيل أو الشراكة
            </p>
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-l from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 text-white rounded-xl gap-2"
            >
              <a href="https://wa.me/201278006248" target="_blank" rel="noopener noreferrer">
                تواصل عبر واتساب
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>
    </AppLayout>
  );
};

export default ExpressPartnership;
