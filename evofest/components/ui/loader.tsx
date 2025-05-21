'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export const QREventLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center gap-6", className)}>
      {/* QR Code Grid Animation */}
      <div className="relative w-40 h-40 grid grid-cols-5 grid-rows-5 gap-1">
        {[...Array(25)].map((_, index) => {
          // Create QR code pattern (simplified)
          const isActive = 
            // Outer border
            index < 5 || 
            index % 5 === 0 || 
            index % 5 === 4 || 
            index > 19 ||
            // Inner pattern
            (index === 7 || index === 9 || index === 17 || index === 11 || index === 13);
          
          return (
            <motion.div
              key={index}
              className={cn(
                "w-full h-full rounded-sm",
                isActive ? "bg-primary-light" : "bg-neutral-light"
              )}
              initial={{ opacity: 0.3, scale: 0.8 }}
              animate={{ 
                opacity: isActive ? [0.3, 1, 0.3] : 0.3,
                scale: isActive ? [0.8, 1.1, 0.8] : 0.8
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0,
                delay: index * 0.02
              }}
            />
          );
        })}

        {/* Animated ticket outline */}
        <motion.div
          className="absolute inset-0 border-2 border-accent-light pointer-events-none"
          initial={{ opacity: 0, rotate: 0, scale: 0.9 }}
          animate={{ 
            opacity: [0, 1, 0],
            rotate: [0, 5, -5, 0],
            scale: [0.9, 1.05, 0.95, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Scanning line animation */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-secondary-light rounded-full"
          initial={{ y: 0, opacity: 0 }}
          animate={{ 
            y: [0, 40, 0],
            opacity: [0, 1, 0]
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Loading text with animation */}
      <div className="flex flex-col items-center gap-2">
        <motion.div
          className="text-lg font-medium text-neutral-dark"
          initial={{ opacity: 0, y: 10 }}
          animate={{ 
            opacity: [0.6, 1, 0.6],
            y: [10, 0, 10]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          Scanning Events
        </motion.div>
        
        <motion.div 
          className="flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {['E', 'v', 'o', 'F', 'e', 's', 't'].map((char, i) => (
            <motion.span
              key={i}
              className="text-sm font-bold"
              style={{
                color: i % 2 === 0 ? '#FF6EC7' : '#7C4DFF'
              }}
              animate={{
                y: [0, -5, 0],
                opacity: [0.6, 1, 0.6]
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.1
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>
      </div>

      {/* Animated progress indicator */}
      <div className="w-48 h-1.5 bg-neutral-light rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-light to-secondary-light"
          initial={{ width: 0 }}
          animate={{ width: ['0%', '30%', '70%', '100%'] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'easeInOut'
          }}
        />
      </div>
    </div>
  );
};

export const PageLoader = () => {
  return (
    <div className="fixed inset-0 z-50 bg-neutral-white/90 backdrop-blur-sm flex items-center justify-center">
      <QREventLoader />
    </div>
  );
};