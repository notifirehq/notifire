import { motion, AnimatePresence } from 'motion/react';
import { useState, useEffect } from 'react';
import { LOADING_MESSAGES } from '../constants';

type LoadingMessage = (typeof LOADING_MESSAGES)[number];

export function LoadingSkeleton() {
  const [loadingMessage, setLoadingMessage] = useState<LoadingMessage>(LOADING_MESSAGES[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      setLoadingMessage((prev) => {
        const currentIndex = LOADING_MESSAGES.indexOf(prev);
        const nextIndex = (currentIndex + 1) % LOADING_MESSAGES.length;
        return LOADING_MESSAGES[nextIndex];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <motion.div
          className="flex flex-col items-center gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative h-12 w-12">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-gray-200"
              style={{ borderTopColor: 'var(--color-primary)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute inset-1 rounded-full border-2 border-gray-100"
              style={{ borderTopColor: 'var(--color-primary-light)' }}
              animate={{ rotate: -180 }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
            />
          </div>
          <AnimatePresence mode="wait">
            <motion.span
              key={loadingMessage}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-r from-gray-500 to-gray-700 bg-clip-text text-sm font-medium text-transparent"
            >
              {loadingMessage}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
