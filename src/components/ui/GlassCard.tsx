import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export default function GlassCard({ children, className = '', hover = false, onClick }: GlassCardProps) {
  return (
    <motion.div
      className={`
        relative backdrop-blur-sm bg-white/5 
        border border-gray-800 rounded-xl shadow-xl
        ${hover ? 'cursor-pointer' : ''}
        ${className}
      `}
      whileHover={hover ? { 
        scale: 1.02, 
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(16px)'
      } : undefined}
      whileTap={hover ? { scale: 0.98 } : undefined}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-xl" />
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}