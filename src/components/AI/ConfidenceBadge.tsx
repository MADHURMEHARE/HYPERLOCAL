import React from 'react';

interface ConfidenceBadgeProps {
  score: number;
}

export default function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  // Determine color theme based on confidence percentage
  const getColorClasses = () => {
    if (score >= 90) {
      return {
        bg: 'bg-emerald-500/10 dark:bg-emerald-500/5',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-500/20 dark:border-emerald-500/10',
        ring: 'ring-emerald-500/10'
      };
    }
    if (score >= 75) {
      return {
        bg: 'bg-cyan-500/10 dark:bg-cyan-500/5',
        text: 'text-cyan-600 dark:text-cyan-400',
        border: 'border-cyan-500/20 dark:border-cyan-500/10',
        ring: 'ring-cyan-500/10'
      };
    }
    if (score >= 50) {
      return {
        bg: 'bg-amber-500/10 dark:bg-amber-500/5',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-500/20 dark:border-amber-500/10',
        ring: 'ring-amber-500/10'
      };
    }
    return {
      bg: 'bg-rose-500/10 dark:bg-rose-500/5',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-500/20 dark:border-rose-500/10',
      ring: 'ring-rose-500/10'
    };
  };

  const colors = getColorClasses();

  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${colors.bg} ${colors.border} ${colors.text} ring-1 ${colors.ring}`}>
      {/* Animated tiny radar circle */}
      <span className="relative flex h-2 w-2">
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${score >= 90 ? 'bg-emerald-400' : score >= 75 ? 'bg-cyan-400' : score >= 50 ? 'bg-amber-400' : 'bg-rose-400'}`}></span>
        <span className={`relative inline-flex rounded-full h-2 w-2 ${score >= 90 ? 'bg-emerald-500' : score >= 75 ? 'bg-cyan-500' : score >= 50 ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
      </span>
      <span className="font-mono text-[10px] font-black uppercase tracking-wider">
        {score}% AI MATCH
      </span>
    </div>
  );
}
