import { motion } from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming cn is your classNames utility

export const TicketLoader = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex flex-col items-center justify-center min-h-screen gap-4", className)}>
      {/* Pair of Tickets */}
      <motion.svg
        width="80"
        height="60"
        viewBox="0 0 80 60"
        initial={{ scale: 0.8, rotate: 0, opacity: 0.7 }}
        animate={{
          scale: [0.8, 1.1, 0.8],
          rotate: [0, 5, -5, 0],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      >
        {/* First Ticket */}
        <rect
          x="2"
          y="2"
          width="56"
          height="36"
          rx="4"
          fill="url(#ticketGradient)"
          stroke="#4b5563"
          strokeWidth="2"
        />
        <path
          d="M8 0 C10 0 12 2 12 4 C12 6 10 8 8 8 C10 8 12 10 12 12 C12 14 10 16 8 16 C10 16 12 18 12 20 C12 22 10 24 8 24 C10 24 12 26 12 28 C12 30 10 32 8 32 C10 32 12 34 12 36 C12 38 10 40 8 40"
          fill="none"
          stroke="#4b5563"
          strokeWidth="1"
        />
        <rect x="14" y="8" width="32" height="24" fill="#f3f4f6" />

        {/* Second Ticket (Offset) */}
        <rect
          x="22"
          y="20"
          width="56"
          height="36"
          rx="4"
          fill="url(#ticketGradient)"
          stroke="#4b5563"
          strokeWidth="2"
        />
        <path
          d="M28 18 C30 18 32 20 32 22 C32 24 30 26 28 26 C30 26 32 28 32 30 C32 32 30 34 28 34 C30 34 32 36 32 38 C32 40 30 42 28 42 C30 42 32 44 32 46 C32 48 30 50 28 50 C30 50 32 52 32 54 C32 56 30 58 28 58"
          fill="none"
          stroke="#4b5563"
          strokeWidth="1"
        />
        <rect x="34" y="26" width="32" height="24" fill="#f3f4f6" />

        {/* Gradient Definition */}
        <defs>
          <linearGradient id="ticketGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#7C4DFF', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#FF6EC7', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
      </motion.svg>

      {/* Animated Text: Book your Tickets */}
      <div className="flex gap-0.5">
        {'Book your Tickets'.split('').map((char, i) => (
          <motion.span
            key={i}
            className="text-lg font-medium text-gray-700"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: [0, 1, 0.7], y: [10, 0, 10] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.1,
            }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>
    </div>
  );
};