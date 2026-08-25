// resources/js/Layouts/AnimatedLayout.jsx
import { AnimatePresence, motion } from 'framer-motion';
import { usePage } from '@inertiajs/react';

export default function AnimatedLayout({ children }) {
  const { component } = usePage();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={component}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}