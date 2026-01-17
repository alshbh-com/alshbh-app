import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Star, Clock, Truck } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  id: string;
  name: string;
  image?: string;
  description?: string;
  rating?: number;
  deliveryTime?: string;
  deliveryFee?: number;
  isOpen?: boolean;
  index?: number;
}

export const CategoryCard = ({
  id,
  name,
  image,
  description,
  rating = 4.5,
  deliveryTime = '30-45',
  deliveryFee = 10,
  isOpen = true,
  index = 0,
}: CategoryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Link
        to={`/restaurant/${id}`}
        className={cn(
          'block bg-card rounded-2xl overflow-hidden shadow-card card-hover',
          !isOpen && 'opacity-60'
        )}
      >
        {/* Image */}
        <div className="relative aspect-[16/10] overflow-hidden">
          {image ? (
            <img
              src={image}
              alt={name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-4xl">🍽️</span>
            </div>
          )}
          
          {/* Status Badge */}
          <div className="absolute top-3 right-3">
            <span
              className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                isOpen
                  ? 'bg-success text-success-foreground'
                  : 'bg-destructive text-destructive-foreground'
              )}
            >
              {isOpen ? 'مفتوح' : 'مغلق'}
            </span>
          </div>

          {/* Rating */}
          <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-background/90 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 text-warning fill-warning" />
            <span className="text-xs font-semibold">{rating}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-bold text-lg mb-1 line-clamp-1">{name}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{deliveryTime} دقيقة</span>
            </div>
            <div className="flex items-center gap-1">
              <Truck className="w-4 h-4" />
              <span>{deliveryFee} جنيه</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};