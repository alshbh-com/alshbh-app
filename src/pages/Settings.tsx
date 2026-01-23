import { motion } from 'framer-motion';
import { ArrowRight, Bell, Moon, Trash2, Info, Shield, Volume2, BellRing, Type, FileText, HelpCircle, Star, Share2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { ShareApp } from '@/components/ShareApp';
import { RateApp } from '@/components/RateApp';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Settings = () => {
  const navigate = useNavigate();
  
  // Load settings from localStorage
  const [orderNotifications, setOrderNotifications] = useState(() => 
    localStorage.getItem('settings_order_notifications') !== 'false'
  );
  const [offerNotifications, setOfferNotifications] = useState(() => 
    localStorage.getItem('settings_offer_notifications') !== 'false'
  );
  const [updateNotifications, setUpdateNotifications] = useState(() => 
    localStorage.getItem('settings_update_notifications') !== 'false'
  );
  const [soundEnabled, setSoundEnabled] = useState(() => 
    localStorage.getItem('settings_sound') !== 'false'
  );
  const [darkMode, setDarkMode] = useState(() => 
    localStorage.getItem('settings_dark_mode') === 'true'
  );
  const [fontSize, setFontSize] = useState(() => 
    localStorage.getItem('settings_font_size') || 'medium'
  );

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('settings_order_notifications', String(orderNotifications));
  }, [orderNotifications]);

  useEffect(() => {
    localStorage.setItem('settings_offer_notifications', String(offerNotifications));
  }, [offerNotifications]);

  useEffect(() => {
    localStorage.setItem('settings_update_notifications', String(updateNotifications));
  }, [updateNotifications]);

  useEffect(() => {
    localStorage.setItem('settings_sound', String(soundEnabled));
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('settings_dark_mode', String(darkMode));
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('settings_font_size', fontSize);
    document.documentElement.style.fontSize = 
      fontSize === 'small' ? '14px' : 
      fontSize === 'large' ? '18px' : '16px';
  }, [fontSize]);

  const handleClearData = () => {
    if (confirm('هل أنت متأكد من حذف جميع البيانات المحفوظة؟')) {
      localStorage.clear();
      toast.success('تم حذف جميع البيانات');
      window.location.reload();
    }
  };

  const settingsGroups = [
    {
      title: 'الإشعارات',
      items: [
        {
          icon: Bell,
          label: 'إشعارات الطلبات',
          description: 'تلقي إشعارات عند تحديث حالة الطلب',
          action: (
            <Switch
              checked={orderNotifications}
              onCheckedChange={setOrderNotifications}
            />
          ),
        },
        {
          icon: BellRing,
          label: 'إشعارات العروض',
          description: 'تلقي إشعارات بالعروض والخصومات',
          action: (
            <Switch
              checked={offerNotifications}
              onCheckedChange={setOfferNotifications}
            />
          ),
        },
        {
          icon: Bell,
          label: 'إشعارات التحديثات',
          description: 'إشعارات بالميزات الجديدة',
          action: (
            <Switch
              checked={updateNotifications}
              onCheckedChange={setUpdateNotifications}
            />
          ),
        },
        {
          icon: Volume2,
          label: 'صوت الإشعارات',
          description: 'تشغيل صوت عند وصول إشعار',
          action: (
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          ),
        },
      ],
    },
    {
      title: 'المظهر',
      items: [
        {
          icon: Moon,
          label: 'الوضع الليلي',
          description: 'تفعيل المظهر الداكن',
          action: (
            <Switch
              checked={darkMode}
              onCheckedChange={setDarkMode}
            />
          ),
        },
        {
          icon: Type,
          label: 'حجم الخط',
          description: 'تخصيص حجم النصوص',
          action: (
            <Select value={fontSize} onValueChange={setFontSize}>
              <SelectTrigger className="w-24 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">صغير</SelectItem>
                <SelectItem value="medium">متوسط</SelectItem>
                <SelectItem value="large">كبير</SelectItem>
              </SelectContent>
            </Select>
          ),
        },
      ],
    },
    {
      title: 'المساعدة',
      items: [
        {
          icon: HelpCircle,
          label: 'الأسئلة الشائعة',
          description: 'إجابات لأكثر الأسئلة شيوعاً',
          onClick: () => navigate('/faq'),
        },
        {
          icon: FileText,
          label: 'شروط الاستخدام',
          description: 'شروط وأحكام التطبيق',
          onClick: () => navigate('/terms'),
        },
        {
          icon: Shield,
          label: 'سياسة الخصوصية',
          description: 'اقرأ سياسة الخصوصية الخاصة بنا',
          onClick: () => navigate('/privacy'),
        },
      ],
    },
    {
      title: 'شارك وقيّم',
      items: [
        {
          icon: Share2,
          label: 'مشاركة التطبيق',
          description: 'شارك التطبيق مع أصدقائك',
          action: <ShareApp variant="icon" />,
        },
        {
          icon: Star,
          label: 'تقييم التطبيق',
          description: 'أخبرنا برأيك في التطبيق',
          action: (
            <RateApp 
              trigger={
                <Button variant="ghost" size="icon">
                  <Star className="w-5 h-5" />
                </Button>
              }
            />
          ),
        },
      ],
    },
    {
      title: 'الخصوصية',
      items: [
        {
          icon: Trash2,
          label: 'حذف البيانات',
          description: 'حذف جميع البيانات المحفوظة محلياً',
          action: (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearData}
              className="text-destructive hover:text-destructive"
            >
              حذف
            </Button>
          ),
        },
      ],
    },
    {
      title: 'حول التطبيق',
      items: [
        {
          icon: Info,
          label: 'الإصدار',
          description: '1.0.0',
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">الإعدادات</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
              {group.title}
            </h2>
            <div className="bg-card rounded-2xl overflow-hidden shadow-soft">
              {group.items.map((item, itemIndex) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`flex items-center gap-4 p-4 ${
                      itemIndex < group.items.length - 1 ? 'border-b' : ''
                    } ${item.onClick ? 'cursor-pointer hover:bg-muted/50 transition-colors' : ''}`}
                    onClick={item.onClick}
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{item.label}</h3>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    {item.action}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Settings;
