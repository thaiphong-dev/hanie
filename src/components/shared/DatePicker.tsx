'use client';

import { useState, useEffect, useRef } from 'react';
import {
  CalendarDays, ChevronLeft, ChevronRight, X,
} from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay,
  isBefore, isAfter, parseISO,
} from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

interface DatePickerProps {
  value: string; // 'yyyy-MM-dd'
  onChange: (d: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export function DatePicker({
  value, onChange, minDate, maxDate, placeholder = 'Chọn ngày...', className,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);
  const [viewMonth, setViewMonth] = useState<Date>(() => {
    if (value) return startOfMonth(parseISO(value));
    if (minDate) return startOfMonth(parseISO(minDate));
    return startOfMonth(new Date());
  });
  const ref = useRef<HTMLDivElement>(null);

  const min = minDate ? parseISO(minDate) : null;
  const max = maxDate ? parseISO(maxDate) : null;
  const selected = value ? parseISO(value) : null;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const monthStart = startOfMonth(viewMonth);
  const monthEnd = endOfMonth(viewMonth);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  function isDisabled(d: Date): boolean {
    if (min && isBefore(d, min) && !isSameDay(d, min)) return true;
    if (max && isAfter(d, max) && !isSameDay(d, max)) return true;
    return false;
  }

  function selectDay(d: Date) {
    if (isDisabled(d)) return;
    onChange(format(d, 'yyyy-MM-dd'));
    setOpen(false);
  }

  const displayLabel = selected
    ? format(selected, 'EEEE, dd/MM/yyyy', { locale: vi })
    : null;

  return (
    <div ref={ref} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border font-body text-sm transition-colors text-left',
          open
            ? 'border-accent bg-white ring-2 ring-accent/20'
            : 'border-bg-secondary bg-white hover:border-accent/50 focus:outline-none focus:border-accent',
          selected ? 'text-text-primary' : 'text-text-muted',
        )}
      >
        <CalendarDays size={16} className={selected ? 'text-accent shrink-0' : 'text-text-muted shrink-0'} />
        <span className="flex-1 capitalize truncate">
          {displayLabel ?? placeholder}
        </span>
        {selected && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => { e.stopPropagation(); onChange(''); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); onChange(''); } }}
            className="p-0.5 hover:bg-bg-secondary rounded shrink-0"
          >
            <X size={13} className="text-text-muted" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 left-0 bg-white border border-border rounded-2xl shadow-xl p-4 w-72">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setViewMonth((m) => subMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <ChevronLeft size={15} className="text-text-muted" />
            </button>
            <p className="font-display text-sm text-text-primary capitalize">
              {format(viewMonth, 'MMMM yyyy', { locale: vi })}
            </p>
            <button
              type="button"
              onClick={() => setViewMonth((m) => addMonths(m, 1))}
              className="p-1.5 rounded-lg hover:bg-bg-secondary transition-colors"
            >
              <ChevronRight size={15} className="text-text-muted" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center font-body text-[11px] text-text-muted py-1 font-semibold">
                {d}
              </div>
            ))}
          </div>

          {/* Days grid */}
          <div className="grid grid-cols-7 gap-px">
            {days.map((day) => {
              const inMonth = isSameMonth(day, viewMonth);
              const isSelected = selected ? isSameDay(day, selected) : false;
              const disabled = isDisabled(day);
              const isToday = isSameDay(day, new Date());

              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  disabled={disabled}
                  onClick={() => selectDay(day)}
                  className={cn(
                    'w-full aspect-square flex items-center justify-center rounded-lg font-body text-xs transition-all',
                    isSelected
                      ? 'bg-accent text-bg-dark font-semibold shadow-sm'
                      : disabled
                      ? 'text-text-muted/25 cursor-not-allowed'
                      : !inMonth
                      ? 'text-text-muted/40 hover:bg-bg-secondary'
                      : isToday
                      ? 'border border-accent/40 text-accent font-semibold hover:bg-accent/10'
                      : 'text-text-primary hover:bg-bg-secondary',
                  )}
                >
                  {format(day, 'd')}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
