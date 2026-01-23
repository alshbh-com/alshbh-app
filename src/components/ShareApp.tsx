import { Share2, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useState } from 'react';

interface ShareAppProps {
  variant?: 'button' | 'icon';
  className?: string;
}

export const ShareApp = ({ variant = 'button', className = '' }: ShareAppProps) => {
  const [copied, setCopied] = useState(false);
  const appUrl = 'https://alshbh.store';
  const shareText = 'جرب تطبيق الشبح لطلب الطعام! 🍔🍕 اطلب من أفضل المطاعم بأسهل طريقة.';

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'تطبيق الشبح',
          text: shareText,
          url: appUrl,
        });
      } catch (err) {
        // User cancelled or share failed
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard();
        }
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(`${shareText}\n${appUrl}`);
    setCopied(true);
    toast.success('تم نسخ الرابط');
    setTimeout(() => setCopied(false), 2000);
  };

  if (variant === 'icon') {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={handleShare}
        className={className}
      >
        {copied ? <Check className="w-5 h-5 text-success" /> : <Share2 className="w-5 h-5" />}
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={handleShare}
      className={`gap-2 ${className}`}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" />
          تم النسخ
        </>
      ) : (
        <>
          <Share2 className="w-4 h-4" />
          شارك التطبيق
        </>
      )}
    </Button>
  );
};
