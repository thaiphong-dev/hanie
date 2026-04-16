'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, Zap, User, CalendarDays, Clock } from 'lucide-react';
import { Link } from '@/lib/navigation';
import { getLocaleText, formatDate } from '@/lib/i18n-helpers';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import type { Database } from '@/types/database';
import type { Locale } from '@/lib/navigation';

type BookingCategory = Database['public']['Tables']['booking_categories']['Row'];

interface TimeSlot {
  time: string;
  available: boolean;
  parallel_available: boolean;
}

interface StaffOption {
  id: string;
  full_name: string;
  specialties: string[];
  color: string;
  avatar_url: string | null;
}

const STEPS = ['step_service', 'step_datetime', 'step_staff', 'step_confirm'] as const;

type Step = 0 | 1 | 2 | 3 | 4; // 4 = success

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? '100%' : '-100%', opacity: 0 }),
};

function BookingContent() {
  const t = useTranslations();
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();

  // Auth — hydrate from sessionStorage on mount, no API call
  const { user, hydrate } = useAuthStore();
  useEffect(() => { hydrate(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── State ──
  const [step, setStep] = useState<Step>(0);
  const [direction, setDirection] = useState(1);

  // Step 0 — Select booking category
  const [bookingCategories, setBookingCategories] = useState<BookingCategory[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Step 1 — Date & time
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [parallelAvailable, setParallelAvailable] = useState(false);
  const [useParallel, setUseParallel] = useState(false);

  // Step 2 — Staff
  const [staffList, setStaffList] = useState<StaffOption[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');

  // Step 3 — Confirm
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Success
  const [, setBookingId] = useState('');

  // ── Load booking categories ──
  useEffect(() => {
    fetch('/api/v1/booking-categories')
      .then((r) => r.json())
      .then((json: { data: BookingCategory[] | null }) => {
        const cats = json.data ?? [];
        setBookingCategories(cats);
        // Pre-select from URL param (by slug)
        const preselect = searchParams.get('category');
        if (preselect) {
          const match = cats.find((c) => c.slug === preselect);
          if (match) setSelectedCategoryIds([match.id]);
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // ── Load staff when entering step 2 ──
  useEffect(() => {
    if (step !== 2) return;
    const dateParam = selectedDate ? `?date=${selectedDate}` : '';
    fetch(`/api/v1/staff${dateParam}`)
      .then((r) => r.json())
      .then((json: { data: StaffOption[] | null }) => setStaffList(json.data ?? []))
      .catch(() => setStaffList([]));
  }, [step, selectedDate]);

  // ── Prefill customer info from logged-in user ──
  useEffect(() => {
    if (user && step === 3) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
    }
  }, [user, step]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load availability ──
  const loadSlots = useCallback(async () => {
    if (!selectedDate || selectedCategoryIds.length === 0) return;
    setSlotsLoading(true);
    try {
      const ids = selectedCategoryIds.join(',');
      const staffParam = selectedStaffId ? `&staff_id=${selectedStaffId}` : '';
      const res = await fetch(
        `/api/v1/availability?date=${selectedDate}&booking_category_ids=${ids}${staffParam}`,
      );
      const json = (await res.json()) as {
        data: { slots: TimeSlot[]; parallel_available: boolean } | null;
      };
      setSlots(json.data?.slots ?? []);
      setParallelAvailable(json.data?.parallel_available ?? false);
    } finally {
      setSlotsLoading(false);
    }
  }, [selectedDate, selectedCategoryIds, selectedStaffId]);

  useEffect(() => {
    if (step === 1) void loadSlots();
  }, [step, loadSlots]);

  // ── Navigation ──
  function goNext() {
    setDirection(1);
    setStep((s) => (s < 4 ? ((s + 1) as Step) : s));
  }

  function goPrev() {
    setDirection(-1);
    setStep((s) => (s > 0 ? ((s - 1) as Step) : s));
  }

  // ── Submit ──
  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError('');
    try {
      const scheduledAt = new Date(`${selectedDate}T${selectedTime}:00+07:00`).toISOString();

      const res = await fetch('/api/v1/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          booking_category_ids: selectedCategoryIds,
          scheduled_at: scheduledAt,
          staff_id: selectedStaffId || undefined,
          customer_name: customerName,
          customer_phone: customerPhone,
          notes: notes || undefined,
          use_parallel: useParallel,
        }),
      });

      const json = (await res.json()) as {
        data: { booking_id: string } | null;
        error: { code: string; message: string } | null;
      };

      if (!res.ok || json.error) {
        const errorCode = json.error?.code ?? 'INTERNAL_ERROR';
        setSubmitError(t(`errors.${errorCode}` as Parameters<typeof t>[0]));
        return;
      }

      setBookingId(json.data?.booking_id ?? '');
      setDirection(1);
      setStep(4);
    } finally {
      setSubmitting(false);
    }
  }

  // ── Computed ──
  const selectedCategories = bookingCategories.filter((c) => selectedCategoryIds.includes(c.id));

  const totalDuration = (() => {
    if (selectedCategories.length === 0) return 0;
    if (useParallel && selectedCategories.length >= 2) {
      return Math.max(...selectedCategories.map((c) => c.duration_min));
    }
    return selectedCategories.reduce((sum, c) => sum + c.duration_min, 0);
  })();

  // Parallel badge: all selected share the same parallel_group
  const showParallelBadge =
    selectedCategories.length >= 2 &&
    selectedCategories.every(
      (c) => c.parallel_group !== null && c.parallel_group === selectedCategories[0]!.parallel_group,
    );

  const canGoNext: Record<number, boolean> = {
    0: selectedCategoryIds.length > 0,
    1: !!selectedDate && !!selectedTime,
    2: true, // staff is optional
    3: customerName.length >= 2 && /^(0[35789])+([0-9]{8})$/.test(customerPhone),
  };

  // ── Render ──
  return (
    <div className="pt-16 min-h-screen bg-bg-primary">
      {/* Stepper */}
      {step < 4 && (
        <div className="sticky top-16 z-30 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
          <div className="mx-auto max-w-2xl px-4 py-4">
            <div className="flex items-center justify-between">
              {STEPS.map((key, idx) => {
                const done = idx < step;
                const active = idx === step;
                return (
                  <div key={key} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors',
                          done
                            ? 'bg-accent text-text-inverse'
                            : active
                            ? 'bg-accent/20 text-accent border border-accent'
                            : 'bg-bg-secondary text-text-muted',
                        )}
                      >
                        {done ? <Check size={14} /> : idx + 1}
                      </div>
                      <span
                        className={cn(
                          'text-[10px] font-body mt-1 hidden sm:block',
                          active ? 'text-accent' : 'text-text-muted',
                        )}
                      >
                        {t(`booking.${key}`)}
                      </span>
                    </div>
                    {idx < STEPS.length - 1 && (
                      <div className={cn('flex-1 h-px mx-2', done ? 'bg-accent' : 'bg-border')} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Step content */}
      <div className="mx-auto max-w-2xl px-4 py-10">
        <AnimatePresence mode="wait" custom={direction}>

          {/* ── Step 0: Select booking category ── */}
          {step === 0 && (
            <motion.div
              key="step0"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <h2 className="font-display text-2xl text-text-primary mb-6">
                {t('booking.select_service')}
              </h2>

              {bookingCategories.length === 0 && (
                <div className="space-y-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton h-20 rounded-2xl" />
                  ))}
                </div>
              )}

              <div className="space-y-3">
                {bookingCategories.map((cat) => {
                  const name = getLocaleText(cat.name_i18n, locale) || cat.name;
                  const selected = selectedCategoryIds.includes(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryIds((prev) =>
                          selected ? prev.filter((id) => id !== cat.id) : [...prev, cat.id],
                        );
                        setSelectedTime('');
                        setSlots([]);
                        setUseParallel(false);
                      }}
                      className={cn(
                        'w-full flex items-center justify-between p-4 rounded-2xl border transition-colors text-left',
                        selected
                          ? 'border-accent bg-accent/5'
                          : 'border-border hover:border-accent/50',
                      )}
                    >
                      <div>
                        <p className="font-display text-base text-text-primary">{name}</p>
                        <p className="font-body text-sm text-text-muted mt-0.5">
                          ~{cat.duration_min} phút · {cat.slot_count} slot
                        </p>
                      </div>
                      {selected && (
                        <div className="w-6 h-6 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                          <Check size={12} className="text-text-inverse" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Parallel hint */}
              {showParallelBadge && (
                <div className="mt-4 flex items-center gap-2 text-accent font-body text-xs p-3 bg-accent/5 rounded-xl border border-accent/20">
                  <Zap size={14} />
                  {t('booking.option_parallel_note')}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Step 1: Date & Time ── */}
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <h2 className="font-display text-2xl text-text-primary mb-6">
                {t('booking.select_date')}
              </h2>

              <div className="mb-6">
                <label className="font-body text-sm text-text-muted block mb-2">
                  {t('booking.select_date')}
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  min={new Date(Date.now() + 3600 * 1000).toISOString().slice(0, 10)}
                  max={new Date(Date.now() + 60 * 24 * 3600 * 1000).toISOString().slice(0, 10)}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                    setSlots([]);
                  }}
                  className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 bg-bg-primary focus:outline-none focus:border-accent"
                />
              </div>

              {selectedDate && (
                <>
                  <label className="font-body text-sm text-text-muted block mb-3">
                    {t('booking.select_time')}
                  </label>

                  {slotsLoading && (
                    <div className="grid grid-cols-4 gap-2">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="skeleton h-10 rounded-xl" />
                      ))}
                    </div>
                  )}

                  {!slotsLoading && (
                    <div className="grid grid-cols-4 gap-2">
                      {slots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={cn(
                            'font-body text-sm py-2.5 rounded-xl border transition-colors',
                            !slot.available
                              ? 'border-border text-text-muted/40 cursor-not-allowed bg-bg-secondary'
                              : selectedTime === slot.time
                              ? 'border-accent bg-accent text-text-inverse'
                              : 'border-border hover:border-accent text-text-primary',
                          )}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Parallel option */}
                  {selectedTime && parallelAvailable && (
                    <div className="mt-6 space-y-2">
                      <p className="font-body text-xs text-text-muted mb-2">Tuỳ chọn phục vụ:</p>
                      {[true, false].map((parallel) => (
                        <button
                          key={String(parallel)}
                          onClick={() => setUseParallel(parallel)}
                          className={cn(
                            'w-full text-left p-4 rounded-2xl border transition-colors',
                            useParallel === parallel
                              ? 'border-accent bg-accent/5'
                              : 'border-border hover:border-accent/50',
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {parallel && <Zap size={14} className="text-accent" />}
                            <span className="font-body text-sm text-text-primary">
                              {parallel
                                ? t('booking.option_parallel', {
                                    duration: Math.max(...selectedCategories.map((c) => c.duration_min)),
                                  })
                                : t('booking.option_sequential', {
                                    duration: selectedCategories.reduce((s, c) => s + c.duration_min, 0),
                                  })}
                            </span>
                          </div>
                          {parallel && (
                            <span className="font-body text-xs text-accent">
                              {t('booking.option_parallel_note')}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
            </motion.div>
          )}

          {/* ── Step 2: Staff ── */}
          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <h2 className="font-display text-2xl text-text-primary mb-6">
                {t('booking.select_staff')}
              </h2>

              <button
                onClick={() => setSelectedStaffId('')}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-2xl border mb-3 transition-colors text-left',
                  selectedStaffId === ''
                    ? 'border-accent bg-accent/5'
                    : 'border-border hover:border-accent/50',
                )}
              >
                <div className="w-10 h-10 rounded-full bg-bg-secondary flex items-center justify-center">
                  <User size={18} className="text-text-muted" />
                </div>
                <p className="font-body text-sm text-text-primary">{t('booking.any_staff')}</p>
                {selectedStaffId === '' && (
                  <Check size={16} className="text-accent ml-auto flex-shrink-0" />
                )}
              </button>

              {staffList.map((staff) => (
                <button
                  key={staff.id}
                  onClick={() => setSelectedStaffId(staff.id)}
                  className={cn(
                    'w-full flex items-center gap-4 p-4 rounded-2xl border mb-3 transition-colors text-left',
                    selectedStaffId === staff.id
                      ? 'border-accent bg-accent/5'
                      : 'border-border hover:border-accent/50',
                  )}
                >
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${staff.color}33` }}
                  >
                    <span className="font-display text-sm" style={{ color: staff.color }}>
                      {staff.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: staff.color }}
                      />
                      <p className="font-body text-sm text-text-primary">{staff.full_name}</p>
                    </div>
                    {staff.specialties.length > 0 && (
                      <p className="font-body text-xs text-text-muted mt-0.5">
                        {staff.specialties.join(' · ')}
                      </p>
                    )}
                  </div>
                  {selectedStaffId === staff.id && (
                    <Check size={16} className="text-accent ml-auto flex-shrink-0" />
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* ── Step 3: Info & Confirm ── */}
          {step === 3 && (
            <motion.div
              key="step3"
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'tween', duration: 0.25 }}
            >
              <h2 className="font-display text-2xl text-text-primary mb-6">
                {t('booking.step_confirm')}
              </h2>

              {/* Summary */}
              <div className="bg-bg-secondary rounded-2xl p-5 mb-6 space-y-3">
                <div className="flex items-start gap-3">
                  <CalendarDays size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body text-xs text-text-muted">Ngày</p>
                    <p className="font-body text-sm text-text-primary">
                      {selectedDate ? formatDate(new Date(selectedDate), locale) : selectedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock size={16} className="text-accent mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-body text-xs text-text-muted">Giờ</p>
                    <p className="font-body text-sm text-text-primary">
                      {selectedTime} · ~{totalDuration} phút
                    </p>
                  </div>
                </div>
                <div className="border-t border-border pt-3 space-y-1">
                  {selectedCategories.map((c) => (
                    <p key={c.id} className="font-body text-sm text-text-primary">
                      {getLocaleText(c.name_i18n, locale) || c.name}
                      {useParallel && selectedCategories.length > 1 && (
                        <span className="text-accent ml-1 text-xs">
                          <Zap size={10} className="inline" />
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>

              {/* Customer info form */}
              <div className="space-y-4">
                <div>
                  <label className="font-body text-sm text-text-muted block mb-1.5">
                    {t('booking.your_name')}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t('auth.name_placeholder')}
                    className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 bg-bg-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-text-muted block mb-1.5">
                    {t('booking.your_phone')}
                  </label>
                  <input
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder={t('auth.phone_placeholder')}
                    className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 bg-bg-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="font-body text-sm text-text-muted block mb-1.5">
                    {t('booking.notes_placeholder')}
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('booking.notes_placeholder')}
                    rows={3}
                    className="w-full font-body text-sm border border-border rounded-xl px-4 py-3 bg-bg-primary focus:outline-none focus:border-accent resize-none"
                  />
                </div>

                {submitError && (
                  <p className="font-body text-sm text-red-500 bg-red-50 px-4 py-3 rounded-xl">
                    {submitError}
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* ── Step 4: Success ── */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1, stiffness: 200 }}
                className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-8"
              >
                <Check size={36} className="text-accent" />
              </motion.div>

              <h2 className="font-display text-3xl text-text-primary mb-4">
                {t('booking.success_title')}
              </h2>
              <p className="font-body text-sm text-text-muted mb-10 max-w-sm mx-auto">
                {t('booking.success_sub')}
              </p>

              <div className="space-y-3">
                <Link
                  href="/"
                  className="block font-body text-sm font-medium tracking-widest uppercase
                    bg-accent hover:bg-accent-dark text-text-inverse
                    px-8 py-4 rounded-full transition-colors duration-200"
                >
                  {t('nav.home')}
                </Link>
                <Link
                  href="/history"
                  className="block font-body text-sm text-accent hover:text-accent-dark transition-colors py-2"
                >
                  {t('nav.history')}
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation buttons */}
        {step < 4 && (
          <div className="mt-10 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={goPrev}
                className="font-body text-sm text-text-muted hover:text-text-primary transition-colors"
              >
                ← {t('common.back')}
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                onClick={goNext}
                disabled={!canGoNext[step]}
                className={cn(
                  'flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase px-6 py-3 rounded-full transition-colors',
                  canGoNext[step]
                    ? 'bg-accent text-text-inverse hover:bg-accent-dark'
                    : 'bg-bg-secondary text-text-muted cursor-not-allowed',
                )}
              >
                {t('common.next')} <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canGoNext[3] || submitting}
                className={cn(
                  'flex items-center gap-2 font-body text-sm font-medium tracking-widest uppercase px-6 py-3 rounded-full transition-colors',
                  canGoNext[3] && !submitting
                    ? 'bg-accent text-text-inverse hover:bg-accent-dark'
                    : 'bg-bg-secondary text-text-muted cursor-not-allowed',
                )}
              >
                {submitting ? t('common.loading') : t('booking.confirm_booking')}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function BookingSkeleton() {
  return (
    <div className="pt-16 min-h-screen bg-bg-primary">
      <div className="mx-auto max-w-2xl px-4 py-10 space-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="skeleton h-20 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<BookingSkeleton />}>
      <BookingContent />
    </Suspense>
  );
}
