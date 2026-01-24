import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const categories = [
  { id: 'pizza', name: 'بيتزا', emoji: '🍕' },
  { id: 'burger', name: 'برجر', emoji: '🍔' },
  { id: 'shawarma', name: 'شاورما', emoji: '🌯' },
  { id: 'chicken', name: 'فراخ', emoji: '🍗' },
  { id: 'drinks', name: 'مشروبات', emoji: '🥤' },
  { id: 'desserts', name: 'حلويات', emoji: '🍰' },
];

export const QuickCategories = () => {
  return (
    <section className="py-4 px-4">
      <div className="container">
        <h2 className="text-lg font-bold mb-3">تصفح سريع</h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Link
                to={`/search?category=${category.name}`}
                className="flex flex-col items-center gap-2 min-w-[72px] p-3 bg-card rounded-2xl shadow-soft hover:shadow-card transition-shadow"
              >
                <span className="text-3xl">{category.emoji}</span>
                <span className="text-xs font-medium whitespace-nowrap">{category.name}</span>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
