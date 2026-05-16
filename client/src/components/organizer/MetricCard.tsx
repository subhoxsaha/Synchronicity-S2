import React from 'react';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend: string;
  className?: string;
  trendUp?: boolean;
}

export function MetricCard({ label, value, icon, trend, className, trendUp }: MetricCardProps) {
  return (
    <div className={`border-[2.5px] border-foreground bg-card shadow-[5px_5px_0_0_var(--foreground)] overflow-hidden relative group transition-all hover:translate-y-[-2px] hover:shadow-[5px_7px_0_0_var(--foreground)] ${className || ''}`}>
      <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
        {React.cloneElement(icon as React.ReactElement<any>, { size: 64 })}
      </div>
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between relative z-10">
          <div className="h-10 w-10 border-[2px] border-foreground/20 bg-primary/5 flex items-center justify-center">
            {icon}
          </div>
          <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-1 border-[1.5px] ${
            trendUp === false
              ? 'text-destructive bg-destructive/5 border-destructive/20'
              : 'text-primary bg-primary/5 border-primary/20'
          }`}>
            {trend}
          </span>
        </div>
        <div className="relative z-10">
          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tighter font-mono">{value}</p>
        </div>
      </div>
    </div>
  );
}
