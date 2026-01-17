import { motion } from 'framer-motion';
import { ArrowRight, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background border-b">
        <div className="container flex items-center h-16 px-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowRight className="w-5 h-5" />
          </Button>
          <h1 className="flex-1 text-center text-lg font-bold">سياسة الخصوصية</h1>
          <div className="w-10" />
        </div>
      </header>

      <div className="container p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">سياسة الخصوصية</h2>
              <p className="text-sm text-muted-foreground">آخر تحديث: يناير 2026</p>
            </div>
          </div>

          <div className="prose prose-sm max-w-none space-y-6">
            <section>
              <h3 className="text-lg font-bold mb-2">مقدمة</h3>
              <p className="text-muted-foreground leading-relaxed">
                نحن في الشبح نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع واستخدام وحماية معلوماتك عند استخدام تطبيقنا.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">البيانات التي نجمعها</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>الاسم ورقم الهاتف للتواصل معك بخصوص طلباتك</li>
                <li>عنوان التوصيل لتوصيل الطلبات بشكل صحيح</li>
                <li>سجل الطلبات لتحسين تجربتك</li>
                <li>تفضيلات التطبيق مثل العناوين المحفوظة</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">كيف نستخدم بياناتك</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>معالجة وتوصيل طلباتك</li>
                <li>التواصل معك بخصوص حالة الطلب</li>
                <li>تحسين خدماتنا وتجربة المستخدم</li>
                <li>إرسال العروض والتحديثات (بموافقتك)</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">حماية البيانات</h3>
              <p className="text-muted-foreground leading-relaxed">
                نستخدم إجراءات أمنية متقدمة لحماية بياناتك من الوصول غير المصرح به أو الفقدان أو التعديل. يتم تخزين بياناتك بشكل آمن ولا يتم مشاركتها مع أطراف ثالثة إلا عند الضرورة لتقديم الخدمة.
              </p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">حقوقك</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2">
                <li>الوصول إلى بياناتك الشخصية</li>
                <li>طلب تصحيح أو حذف بياناتك</li>
                <li>إلغاء الاشتراك في الإشعارات</li>
                <li>حذف حسابك وجميع البيانات المرتبطة</li>
              </ul>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-2">تواصل معنا</h3>
              <p className="text-muted-foreground leading-relaxed">
                إذا كان لديك أي أسئلة حول سياسة الخصوصية، يمكنك التواصل معنا عبر واتساب على الرقم 01278006248.
              </p>
            </section>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;
