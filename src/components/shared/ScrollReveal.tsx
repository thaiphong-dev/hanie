'use client';

import { motion, type Variants } from 'framer-motion';
import { fadeUp, staggerContainer } from '@/lib/motion-variants';

// ── ScrollReveal ─────────────────────────────────────────────────────────────

interface ScrollRevealProps {
  children: React.ReactNode;
  variants?: Variants;
  className?: string;
  delay?: number;
}

/**
 * Wrap bất kỳ nội dung nào — animate khi scroll vào viewport.
 * Mặc định dùng fadeUp variant.
 */
export function ScrollReveal({
  children,
  variants = fadeUp,
  className,
  delay = 0,
}: ScrollRevealProps) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={variants}
      transition={{ delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerGrid ──────────────────────────────────────────────────────────────

interface StaggerGridProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Grid container với stagger animation.
 * Wrap children trong StaggerItem để có stagger effect.
 */
export function StaggerGrid({ children, className }: StaggerGridProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-50px' }}
      variants={staggerContainer}
    >
      {children}
    </motion.div>
  );
}

// ── StaggerItem ──────────────────────────────────────────────────────────────

/**
 * Item trong StaggerGrid — tự động nhận stagger delay từ parent.
 * Dùng làm wrapper cho ServiceCard, GalleryItem, etc.
 */
export function StaggerItem({ children, className }: StaggerGridProps) {
  return (
    <motion.div variants={fadeUp} className={className}>
      {children}
    </motion.div>
  );
}

// ── PageTransition ───────────────────────────────────────────────────────────

import { AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

/**
 * Wrap trong layout để có page transition animation.
 * Dùng trong src/app/[locale]/(customer)/layout.tsx
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
