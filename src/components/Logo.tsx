import { motion } from 'framer-motion';
import { UtensilsCrossed } from 'lucide-react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const Logo = ({ size = 'md', showText = true, className = '' }: LogoProps) => {
  const sizes = {
    sm: { icon: 'w-8 h-8', text: 'text-lg', iconSize: 'w-4 h-4' },
    md: { icon: 'w-10 h-10', text: 'text-xl', iconSize: 'w-5 h-5' },
    lg: { icon: 'w-16 h-16', text: 'text-3xl', iconSize: 'w-8 h-8' },
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className={`${sizes[size].icon} rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-soft neon-glow`}>
        <UtensilsCrossed className={`${sizes[size].iconSize} text-primary-foreground`} />
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={`${sizes[size].text} font-bold text-gradient`}>
            الشبح فود
          </span>
          {size !== 'sm' && (
            <span className="text-xs text-muted-foreground -mt-1">
              توصيل طعام
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
