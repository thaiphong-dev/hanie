"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { X, Clock, User, Phone, Scissors, UserCheck, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/shared/DatePicker";
import { StaffUser } from "./page";

interface BookingCategory {
  id: string;
  name: string;
  slug: string;
}

interface AdminBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  staffList: StaffUser[];
}

export function AdminBookingModal({ isOpen, onClose, onSuccess, staffList }: AdminBookingModalProps) {
  const t = useTranslations("admin");
  const te = useTranslations("errors");
  const ta = useTranslations("auth");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [bookingCategories, setBookingCategories] = useState<BookingCategory[]>([]);
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedTime, setSelectedTime] = useState("09:00");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [notes, setNotes] = useState("");
  const [useParallel, setUseParallel] = useState(false);

  useEffect(() => {
    if (isOpen) {
      void fetch("/api/v1/booking-categories")
        .then(r => r.json())
        .then((j: { data: BookingCategory[] }) => {
          setBookingCategories(j.data || []);
        });
    }
  }, [isOpen]);

  // Generate 30-min time slots 08:00 - 20:00
  const timeOptions = [];
  for (let h = 8; h <= 20; h++) {
    const hh = h.toString().padStart(2, '0');
    timeOptions.push(`${hh}:00`);
    if (h < 20) timeOptions.push(`${hh}:30`);
  }

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
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
        setSubmitError(te(errorCode) || json.error?.message || "Error");
        return;
      }

      onSuccess();
      onClose();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg-dark/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-bg-secondary">
          <h3 className="font-display text-xl text-text-primary">{t("new_booking")}</h3>
          <button onClick={onClose} className="p-2 hover:bg-bg-secondary rounded-xl transition-colors">
            <X className="w-5 h-5 text-text-muted" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto scrollbar-hide">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-body text-xs text-text-muted uppercase tracking-wider">
                <User className="w-3.5 h-3.5" />
                {t("booking_customer_name")}
              </label>
              <input
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                placeholder={ta("name_placeholder")}
              />
            </div>

            {/* Customer Phone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-body text-xs text-text-muted uppercase tracking-wider">
                <Phone className="w-3.5 h-3.5" />
                {t("booking_customer_phone")}
              </label>
              <input
                required
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
                placeholder={ta("phone_placeholder")}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Date */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-body text-xs text-text-muted uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                {t("date")}
              </label>
              <DatePicker
                value={selectedDate}
                onChange={(d) => setSelectedDate(d)}
                placeholder="Chọn ngày..."
              />
            </div>

            {/* Time — custom styled select */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 font-body text-xs text-text-muted uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                {t("time")}
              </label>
              <div className="relative">
                <select
                  required
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full appearance-none px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all pr-9"
                >
                  {timeOptions.map(time => (
                    <option key={time} value={time}>{time}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              </div>
            </div>
          </div>

          {/* Category Selection (Multi-select) */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-body text-xs text-text-muted uppercase tracking-wider">
              <Scissors className="w-3.5 h-3.5" />
              {t("booking_category")}
            </label>
            <div className="flex flex-wrap gap-2 p-3 rounded-xl border border-bg-secondary bg-bg-secondary/20 min-h-[46px]">
              {bookingCategories.map((cat) => {
                const isSelected = selectedCategoryIds.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedCategoryIds(prev => prev.filter(id => id !== cat.id));
                      } else {
                        setSelectedCategoryIds(prev => [...prev, cat.id]);
                      }
                    }}
                    className={cn(
                      "px-3 py-1 rounded-full text-xs font-medium transition-all border",
                      isSelected 
                        ? "bg-accent border-accent text-bg-dark shadow-sm"
                        : "bg-white border-bg-secondary text-text-muted hover:border-accent/40"
                    )}
                  >
                    {cat.name}
                  </button>
                );
              })}
              {selectedCategoryIds.length === 0 && (
                <span className="text-xs text-text-muted italic opacity-60 px-1 py-1">
                  {t("select_category")}...
                </span>
              )}
            </div>
          </div>

          {/* Staff Selection */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-body text-xs text-text-muted uppercase tracking-wider">
              <UserCheck className="w-3.5 h-3.5" />
              {t("booking_staff")}
            </label>
            <select
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all appearance-none"
            >
              <option value="">-- {t("select_staff")} (Any) --</option>
              {staffList.map(s => (
                <option key={s.id} value={s.id}>{s.full_name}</option>
              ))}
            </select>
          </div>

          {/* Parallel Service Toggle */}
          <div className="flex items-center gap-3 py-1">
            <button
              type="button"
              onClick={() => setUseParallel(!useParallel)}
              className={cn(
                "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus:outline-none",
                useParallel ? "bg-accent" : "bg-bg-secondary"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                  useParallel ? "translate-x-4" : "translate-x-0"
                )}
              />
            </button>
            <span className="text-xs text-text-secondary font-medium">{t("use_parallel")}</span>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-2 font-body text-xs text-text-muted uppercase tracking-wider">
              {t("notes")}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-bg-secondary bg-white font-body text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all min-h-[80px] resize-none"
              placeholder="..."
            />
          </div>

          {submitError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 font-body text-xs text-center">
              {submitError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-bg-secondary font-body text-sm text-text-secondary hover:bg-bg-secondary transition-colors"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={submitting || selectedCategoryIds.length === 0}
              className="flex-1 py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors shadow-lg shadow-accent/20"
            >
              {submitting ? "..." : t("confirm")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
