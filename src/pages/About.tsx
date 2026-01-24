import { motion } from 'framer-motion';
import { ArrowRight, Heart, Truck, Clock, Shield, Phone, MapPin, Star, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/Logo';

const About = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Truck,
      title: 'توصيل سريع',
      description: 'نوصل طلبك في أسرع وقت ممكن لباب بيتك',
    },
    {
      icon: Clock,
      title: 'متاحين 24/7',
      description: 'خدمة العملاء متاحة على مدار الساعة',
    },
    {
      icon: Shield,
      title: 'دفع آمن',
      description: 'نضمن سلامة معاملاتك المالية',
    },
    {
      icon: Heart,
      title: 'جودة عالية',
      description: 'نختار أفضل المطاعم والمنتجات لعملائنا',
    },
  ];

  const teamMembers = [
    {
      name: 'أحمد محمد',
      role: 'المؤسس والمدير التنفيذي',
      avatar: '👨‍💼',
    },
    {
      name: 'محمد أحمد',
      role: 'مدير العمليات',
      avatar: '👨‍💻',
    },
    {
      name: 'سارة أحمد',
      role: 'مديرة خدمة العملاء',
      avatar: '👩‍💼',
    },
  ];

  const stats = [
    { value: '+1000', label: 'طلب مكتمل', icon: Star },
    { value: '+50', label: 'مطعم شريك', icon: Truck },
    { value: '+500', label: 'عميل سعيد', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">من نحن</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4 space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-8"
        >
          <div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gradient">الشبح فود</h1>
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            منصتك الأولى لتوصيل الطعام في كفر شكر والمناطق المجاورة
          </p>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-4"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-card rounded-2xl p-4 text-center shadow-soft"
              >
                <div className="w-10 h-10 mx-auto mb-2 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            );
          })}
        </motion.div>

        {/* Story */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <h2 className="text-xl font-bold mb-4">قصتنا</h2>
          <p className="text-muted-foreground leading-relaxed">
            بدأت رحلة الشبح فود في عام 2024 بهدف بسيط: جعل توصيل الطعام سهلاً ومتاحاً للجميع في كفر شكر والمناطق المجاورة. 
            نؤمن بأن كل شخص يستحق الحصول على وجبته المفضلة بجودة عالية وسرعة فائقة.
          </p>
          <p className="text-muted-foreground leading-relaxed mt-4">
            نعمل مع أفضل المطاعم المحلية لنقدم لك تجربة طعام لا تُنسى. فريقنا المتفاني يعمل على مدار الساعة لضمان رضاك التام.
          </p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-xl font-bold mb-4">لماذا الشبح فود؟</h2>
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="bg-card rounded-2xl p-4 shadow-soft"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-3">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold mb-1">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Team */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold mb-4">فريقنا</h2>
          <div className="grid grid-cols-1 gap-4">
            {teamMembers.map((member, index) => (
              <motion.div
                key={member.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="flex items-center gap-4 bg-card rounded-2xl p-4 shadow-soft"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-3xl">
                  {member.avatar}
                </div>
                <div>
                  <h3 className="font-bold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-primary to-accent rounded-2xl p-6 text-primary-foreground"
        >
          <h2 className="text-xl font-bold mb-4">تواصل معنا</h2>
          <div className="space-y-3">
            <a 
              href="tel:01278006248" 
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <Phone className="w-5 h-5" />
              <span>01278006248</span>
            </a>
            <a 
              href="https://wa.me/201278006248" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-3 hover:opacity-80 transition-opacity"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span>واتساب</span>
            </a>
            <div className="flex items-center gap-3">
              <MapPin className="w-5 h-5" />
              <span>كفر شكر - القليوبية - مصر</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
