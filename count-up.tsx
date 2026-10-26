"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

type Props = {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  compact?: boolean;
  className?: string;
};

function format(value: number, compact: boolean): string {
  if (compact && value >= 1_000_000_000)
    return `${(value / 1_000_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 1,
    })} M`;
  if (compact && value >= 1_000_000)
    return `${(value / 1_000_000).toLocaleString("id-ID", {
      maximumFractionDigits: 0,
    })} Jt`;
  return Math.round(value).toLocaleString("id-ID");
}

export default function CountUp({
  end,
  duration = 1800,
  prefix = "",
  suffix = "",
  compact = false,
  className,
}: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setValue(end * eased);
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, end, duration]);

  return (
    <span ref={ref} className={className}>
      {prefix}
      {format(value, compact)}
      {suffix}
    </span>
  );
}
