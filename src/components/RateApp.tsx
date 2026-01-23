import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface RateAppProps {
  trigger?: React.ReactNode;
}

export const RateApp = ({ trigger }: RateAppProps) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    if (rating === 0) {
      toast.error('يرجى اختيار تقييم');
      return;
    }

    // Store rating locally
    localStorage.setItem('app_rating', JSON.stringify({ rating, feedback, date: new Date().toISOString() }));
    
    toast.success('شكراً لتقييمك! 🎉');
    setOpen(false);
    setRating(0);
    setFeedback('');
  };

  const hasRated = localStorage.getItem('app_rating');

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Star className="w-4 h-4" />
            {hasRated ? 'تعديل التقييم' : 'قيّم التطبيق'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">قيّم تجربتك</DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          {/* Stars */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <motion.button
                key={star}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1"
              >
                <Star
                  className={`w-10 h-10 transition-colors ${
                    star <= (hoveredRating || rating)
                      ? 'fill-warning text-warning'
                      : 'text-muted-foreground'
                  }`}
                />
              </motion.button>
            ))}
          </div>

          {/* Rating Text */}
          <p className="text-center text-muted-foreground">
            {rating === 0 && 'اختر تقييمك'}
            {rating === 1 && 'سيئ جداً 😞'}
            {rating === 2 && 'سيئ 😕'}
            {rating === 3 && 'مقبول 😐'}
            {rating === 4 && 'جيد 😊'}
            {rating === 5 && 'ممتاز! 🎉'}
          </p>

          {/* Feedback */}
          <Textarea
            placeholder="أخبرنا برأيك... (اختياري)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="resize-none"
            rows={3}
          />

          <Button onClick={handleSubmit} className="w-full">
            إرسال التقييم
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
