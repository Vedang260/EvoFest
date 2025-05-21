'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';// Assuming cn is a utility for classNames
import { useEffect, useState } from 'react';

// Generate a pseudo-random QR code pattern
const generateQRPattern = (size: number) => {
  const pattern = [];
  for (let i = 0; i < size * size; i++) {
    // Create a more complex pattern with alignment squares
    const row = Math.floor(i / size);
    const col = i % size;
    const isAlignment =
      (row < 2 && col < 2) || // Top-left
      (row < 2 && col >= size - 2) || // Top-right
      (row >= size - 2 && col < 2) || // Bottom-left
      (Math.random() > 0.5 && row > 2 && row < size - 3 && col > 2 && col < size - 3); // Random inner
    pattern.push(isAlignment);
  }
  return pattern;
};

export const QREventLoader = ({ className }: { className?: string }) => {
  const [qrPattern, setQrPattern] = useState<boolean[]>([]);

  useEffect(() => {
    setQrPattern(generateQRPattern(7)); // 7x7 grid for more detail
  }, []);

  return (
    <div className={cn("flex flex-col items-center justify-center gap-6 p-4", className)}>
      {/* Ticket Card */}
      <motion.div
        className="relative w-64 bg-white rounded-lg shadow-lg overflow-hidden"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          backgroundImage: 'linear-gradient(45deg, #f3f4f6 25%, #ffffff 25%, #ffffff 50%, #f3f4f6 50%, #f3f4f6 75%, #ffffff 75%, #ffffff)',
          backgroundSize: '20px 20px',
        }}
      >
        {/* Perforated Edge Effect */}
        <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-gray-200 to-transparent" style={{ clipPath: 'url(#perforation)' }} />
        <svg className="absolute" width="0" height="0">
          <defs>
            <clipPath id="perforation">
              <path d="M0,0 H4 C4,2 2,4 0,4 V8 C2,8 4,10 4,12 H0 V16 C2,16 4,18 4,20 H0 V24 C2,24 4,26 4,28 H0 V32 C2,32 4,34 4,36 H0 V40 C2,40 4,42 4,44 H0 V48 Z" />
            </clipPath>
          </defs>
        </svg>

        {/* QR Code Grid */}
        <div className="relative w-40 h-40 mx-auto mt-4 grid grid-cols-7 grid-rows-7 gap-0.5 bg-white p-2 border-2 border-gray-300">
          {qrPattern.map((isActive, index) => (
            <motion.div
              key={index}
              className={cn("w-full h-full rounded-sm", isActive ? "bg-black" : "bg-white")}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isActive ? [0, 1, 0.8] : 1,
                scale: isActive ? [0, 1, 0.95] : 1
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 0.5,
                delay: index * 0.03
              }}
            />
          ))}

          {/* Scanning Line */}
          <motion.div
            className="absolute left-0 right-0 h-1 bg-red-500 rounded-full shadow-[0_0_8px_rgba(255,0,0,0.6)]"
            initial={{ y: -40, opacity: 0 }}
            animate={{ 
              y: [-40, 40, -40],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        {/* Ticket Details */}
        <div className="p-4 text-center">
          <motion.h2
            className="text-lg font-bold text-gray-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            EvoFest 2025
          </motion.h2>
          <motion.p
            className="text-sm text-gray-600"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            May 21, 2025 | 7:00 PM
          </motion.p>
          <motion.div
            className="mt-2 h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded"
            initial={{ width: 0 }}
            animate={{ width: '80%' }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse', ease: 'easeInOut' }}
          />
        </div>
      </motion.div>

      {/* Loading Text */}
      <motion.div
        className="text-lg font-medium text-gray-700"
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
        Preparing Your Ticket
      </motion.div>
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