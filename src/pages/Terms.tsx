import { motion } from 'framer-motion';
import { ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Terms = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: 'مقدمة',
      content: `مرحباً بك في تطبيق الشبح. باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بهذه الشروط والأحكام. يرجى قراءتها بعناية قبل استخدام التطبيق.`,
    },
    {
      title: 'طبيعة الخدمة',
      content: `الشبح هو منصة وسيطة تربط بين المستخدمين والمطاعم. نحن لسنا مسؤولين عن جودة الطعام أو التأخير في التوصيل من قبل المطاعم الشريكة. أسماء المطاعم المعروضة هي لأغراض تنظيمية فقط.`,
    },
    {
      title: 'الطلبات والدفع',
      content: `جميع الطلبات تتم عبر واتساب ويتم الدفع عند الاستلام. الأسعار المعروضة قد تتغير دون إشعار مسبق. رسوم التوصيل تختلف حسب المنطقة ويتم توضيحها قبل إتمام الطلب.`,
    },
    {
      title: 'إلغاء الطلبات',
      content: `يمكن إلغاء الطلب قبل بدء التحضير عبر التواصل معنا على واتساب. بعد بدء التحضير، قد لا يكون الإلغاء ممكناً أو قد تطبق رسوم.`,
    },
    {
      title: 'المسؤولية',
      content: `نحن غير مسؤولين عن أي أضرار ناتجة عن استخدام التطبيق أو الطلبات المقدمة. المستخدم مسؤول عن صحة البيانات المدخلة بما في ذلك العنوان ورقم الهاتف.`,
    },
    {
      title: 'حقوق الملكية',
      content: `جميع المحتويات والتصميمات في التطبيق هي ملك لمنصة الشبح. لا يجوز نسخ أو إعادة إنتاج أي جزء من التطبيق دون إذن كتابي.`,
    },
    {
      title: 'التعديلات',
      content: `نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرارك في استخدام التطبيق بعد التعديلات يعني موافقتك على الشروط الجديدة.`,
    },
    {
      title: 'التواصل',
      content: `لأي استفسارات حول هذه الشروط، يمكنك التواصل معنا عبر واتساب على الرقم: 01278006248`,
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
          <h1 className="flex-1 text-center text-lg font-bold">شروط الاستخدام</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
            <FileText className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">شروط وأحكام الاستخدام</h2>
          <p className="text-muted-foreground mt-2 text-sm">
            آخر تحديث: يناير 2026
          </p>
        </motion.div>

        <div className="space-y-4">
          {sections.map((section, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-soft"
            >
              <h3 className="font-bold text-primary mb-2">{section.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          باستخدامك للتطبيق، فإنك توافق على هذه الشروط
        </motion.p>
      </div>
    </div>
  );
};

export default Terms;
