"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  sub?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  emptyLabel?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  className,
  emptyLabel = "Không có lựa chọn",
}: CustomSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border font-body text-sm transition-colors",
          open
            ? "border-accent bg-white"
            : "border-bg-secondary bg-white hover:border-accent/50",
          disabled && "opacity-50 cursor-not-allowed",
          selected ? "text-text-primary" : "text-text-muted",
        )}
      >
        <span className="truncate">
          {selected ? selected.label : (placeholder ?? "Chọn...")}
        </span>
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 shrink-0 text-text-muted transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="absolute z-[200] mt-1 w-full max-w-max bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
          {placeholder && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="w-full text-left px-3 py-2.5 font-body text-sm text-text-muted hover:bg-bg-secondary transition-colors"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={cn(
                "w-full text-left px-3 py-2.5 font-body text-sm transition-colors whitespace-nowrap",
                value === opt.value
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-primary hover:bg-bg-secondary",
              )}
            >
              <span>{opt.label}</span>
              {opt.sub && (
                <span className="block text-xs text-text-muted">{opt.sub}</span>
              )}
            </button>
          ))}
          {options.length === 0 && (
            <p className="px-3 py-3 font-body text-xs text-text-muted text-center">
              {emptyLabel}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
