'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
  glow?: boolean;
}

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  },
  hover: {
    y: -4,
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  hover = true,
  glow = false 
}: AnimatedCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover={hover ? "hover" : undefined}
      transition={{ delay }}
      className={cn(
        "transition-all duration-300",
        glow && "hover:shadow-glow hover:shadow-delta/30",
        className
      )}
    >
      <Card className="card-hover">
        {children}
      </Card>
    </motion.div>
  );
}

interface AnimatedCardContentProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function AnimatedCardContent({ 
  title, 
  description, 
  children, 
  className 
}: AnimatedCardContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className={className}
    >
      {title && (
        <CardHeader>
          <CardTitle className="gradient-text">{title}</CardTitle>
          {description && (
            <CardDescription className="text-muted-foreground">
              {description}
            </CardDescription>
          )}
        </CardHeader>
      )}
      <CardContent>
        {children}
      </CardContent>
    </motion.div>
  );
}
