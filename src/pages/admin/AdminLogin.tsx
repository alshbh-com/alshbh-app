import { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const ADMIN_PASSWORD = 'admin123'; // In production, this should be handled securely
const MAX_ATTEMPTS = 3;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(() => {
    const saved = localStorage.getItem('admin_attempts');
    return saved ? JSON.parse(saved) : { count: 0, lockoutUntil: null };
  });

  const isLockedOut = attempts.lockoutUntil && Date.now() < attempts.lockoutUntil;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLockedOut) {
      const remaining = Math.ceil((attempts.lockoutUntil - Date.now()) / 60000);
      toast.error(`محاولات كثيرة. انتظر ${remaining} دقيقة`);
      return;
    }

    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (password === ADMIN_PASSWORD) {
      // Reset attempts on successful login
      localStorage.removeItem('admin_attempts');
      localStorage.setItem('admin_authenticated', 'true');
      localStorage.setItem('admin_auth_time', Date.now().toString());
      toast.success('تم تسجيل الدخول بنجاح');
      navigate('/admin/dashboard');
    } else {
      const newCount = attempts.count + 1;
      const newAttempts = {
        count: newCount,
        lockoutUntil: newCount >= MAX_ATTEMPTS ? Date.now() + LOCKOUT_TIME : null,
      };
      setAttempts(newAttempts);
      localStorage.setItem('admin_attempts', JSON.stringify(newAttempts));
      
      if (newCount >= MAX_ATTEMPTS) {
        toast.error('تم قفل الحساب لمدة 5 دقائق');
      } else {
        toast.error(`كلمة المرور خاطئة. ${MAX_ATTEMPTS - newCount} محاولات متبقية`);
      }
    }

    setLoading(false);
    setPassword('');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowRight className="w-5 h-5 ml-2" />
          العودة
        </Button>

        <div className="bg-card rounded-2xl p-8 shadow-soft">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">لوحة التحكم</h1>
            <p className="text-muted-foreground mt-2">أدخل كلمة المرور للوصول</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="كلمة المرور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pr-4 pl-12 rounded-xl"
                disabled={isLockedOut}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute left-1 top-1/2 -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Eye className="w-5 h-5 text-muted-foreground" />
                )}
              </Button>
            </div>

            {isLockedOut && (
              <p className="text-destructive text-sm text-center">
                تم قفل الحساب. انتظر {Math.ceil((attempts.lockoutUntil - Date.now()) / 60000)} دقيقة
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 rounded-xl"
              disabled={loading || isLockedOut || !password}
            >
              {loading ? (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                />
              ) : (
                'دخول'
              )}
            </Button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
