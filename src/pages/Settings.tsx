import { motion } from 'framer-motion';
import { ArrowRight, Bell, Moon, Globe, Trash2, Info, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { useState } from 'react';
import { toast } from 'sonner';

const Settings = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

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
              checked={notifications}
              onCheckedChange={setNotifications}
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
              onCheckedChange={(checked) => {
                setDarkMode(checked);
                document.documentElement.classList.toggle('dark', checked);
              }}
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
        {
          icon: Shield,
          label: 'سياسة الخصوصية',
          description: 'اقرأ سياسة الخصوصية الخاصة بنا',
          onClick: () => navigate('/privacy'),
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
        {
          icon: Globe,
          label: 'اللغة',
          description: 'العربية',
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
