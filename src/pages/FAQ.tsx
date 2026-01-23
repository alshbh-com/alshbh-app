import { motion } from 'framer-motion';
import { ArrowRight, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    question: 'كيف أقوم بتقديم طلب؟',
    answer: 'اختر المطعم المفضل لديك، ثم اختر الأصناف التي تريدها وأضفها للسلة، ثم اذهب للسلة وأكمل بيانات التوصيل وأرسل الطلب عبر واتساب.',
  },
  {
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'حالياً الدفع عند الاستلام فقط. يمكنك الدفع نقداً للمندوب عند استلام طلبك.',
  },
  {
    question: 'كم تستغرق مدة التوصيل؟',
    answer: 'تختلف مدة التوصيل حسب المطعم وموقعك. عادة ما تتراوح بين 30 إلى 60 دقيقة.',
  },
  {
    question: 'هل يمكنني إلغاء طلبي؟',
    answer: 'نعم، يمكنك إلغاء الطلب عن طريق التواصل معنا على واتساب قبل بدء تحضير الطلب.',
  },
  {
    question: 'هل توجد رسوم توصيل؟',
    answer: 'نعم، تختلف رسوم التوصيل حسب القرية/المنطقة. يتم عرض رسوم التوصيل بوضوح قبل إتمام الطلب.',
  },
  {
    question: 'كيف أتتبع طلبي؟',
    answer: 'يمكنك متابعة حالة طلبك من صفحة "طلباتي" في التطبيق، أو عبر رسائل واتساب.',
  },
  {
    question: 'ماذا أفعل إذا وصل طلبي ناقصاً أو خاطئاً؟',
    answer: 'تواصل معنا فوراً عبر واتساب وسنعمل على حل المشكلة في أسرع وقت.',
  },
  {
    question: 'هل يمكنني تغيير عنوان التوصيل؟',
    answer: 'نعم، يمكنك إضافة وتعديل عناوين التوصيل من صفحة "عناويني" في ملفك الشخصي.',
  },
];

const FAQ = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">الأسئلة الشائعة</h1>
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
            <HelpCircle className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold">كيف يمكننا مساعدتك؟</h2>
          <p className="text-muted-foreground mt-2">
            إليك إجابات أكثر الأسئلة شيوعاً
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border-none shadow-soft px-4"
              >
                <AccordionTrigger className="text-right hover:no-underline py-4">
                  <span className="font-medium">{faq.question}</span>
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 p-6 bg-primary/5 rounded-2xl text-center"
        >
          <h3 className="font-bold mb-2">لم تجد إجابة سؤالك؟</h3>
          <p className="text-sm text-muted-foreground mb-4">
            تواصل معنا وسنرد عليك في أقرب وقت
          </p>
          <a
            href="https://wa.me/201278006248"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button className="gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              تواصل عبر واتساب
            </Button>
          </a>
        </motion.div>
      </div>
    </div>
  );
};

export default FAQ;
