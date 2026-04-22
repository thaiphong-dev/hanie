"use client";

import { useEffect, useState, Suspense, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Plus, Trash2, X, CheckCircle2, UserCheck, Tag, ChevronDown, Search, User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useAuthStore } from "@/stores/authStore";
import { Database } from "@/types/database";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ServiceOption {
  id: string;
  name: string;
  name_i18n: Record<string, string>;
  price_min: number;
  price_max: number;
  unit: string;
  category_id: string;
}

interface OrderLine {
  category_id: string | null;
  service_id: string | null;
  service_name: string;
  price: number;
  quantity: number;
  unit: string;
  note: string;
}

interface CustomerInfo {
  id: string | null;
  full_name: string;
  phone: string;
  member_tier: string;
}

interface CustomerVoucher {
  id: string;
  voucher: {
    id: string;
    code: string;
    name: string;
    discount_type: "percent" | "fixed";
    discount_value: number;
    min_order_amount: number | null;
    expires_at: string | null;
  } | null;
}

type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
interface ServiceWithCategory extends ServiceRow {
  category?: { id: string; name: string; name_i18n: Record<string, string>; slug: string } | null;
}
type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

interface StaffMember {
  id: string;
  full_name: string;
  phone: string;
}

type PaymentMethod = "cash" | "transfer" | "card";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatVND(n: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(n);
}

const TIER_COLORS: Record<string, string> = {
  new: "bg-gray-100 text-gray-600",
  regular: "bg-blue-50 text-blue-700",
  vip: "bg-purple-50 text-purple-700",
  vvip: "bg-amber-50 text-amber-700",
};

// ── Custom Select ─────────────────────────────────────────────────────────────

interface SelectOption { value: string; label: string; sub?: string }

function CustomSelect({
  value, onChange, options, placeholder, disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
}) {
  const t = useTranslations("pos");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border font-body text-sm transition-colors",
          open ? "border-accent bg-white" : "border-bg-secondary bg-white hover:border-accent/50",
          disabled && "opacity-50 cursor-not-allowed",
          selected ? "text-text-primary" : "text-text-muted",
        )}
      >
        <span className="truncate">{selected ? selected.label : (placeholder ?? t("select_placeholder"))}</span>
        <ChevronDown className={cn("w-3.5 h-3.5 shrink-0 text-text-muted transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden max-h-56 overflow-y-auto">
          {placeholder && (
            <button
              type="button"
              onClick={() => { onChange(""); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 font-body text-sm text-text-muted hover:bg-bg-secondary transition-colors"
            >
              {placeholder}
            </button>
          )}
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={cn(
                "w-full text-left px-3 py-2.5 font-body text-sm transition-colors",
                opt.value === value
                  ? "bg-accent/10 text-accent font-medium"
                  : "text-text-primary hover:bg-bg-secondary",
              )}
            >
              <span>{opt.label}</span>
              {opt.sub && <span className="block text-xs text-text-muted">{opt.sub}</span>}
            </button>
          ))}
          {options.length === 0 && (
            <p className="px-3 py-3 font-body text-xs text-text-muted text-center">{t("no_options")}</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Customer Search Combobox ──────────────────────────────────────────────────

function CustomerSearchBox({
  customer,
  onSelect,
  onClear,
  placeholder,
}: {
  customer: CustomerInfo | null;
  onSelect: (c: CustomerInfo) => void;
  onClear: () => void;
  placeholder?: string;
}) {
  const t = useTranslations("pos");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CustomerInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [newName, setNewName] = useState("");
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); setShowNew(false); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/customers?search=${encodeURIComponent(q.trim())}`);
      const json = (await res.json()) as { data: CustomerInfo[] };
      setResults(json.data ?? []);
      setShowNew((json.data ?? []).length === 0);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleChange(val: string) {
    setQuery(val);
    setOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (val.length >= 2) {
      debounceRef.current = setTimeout(() => void doSearch(val), 600);
    } else {
      setResults([]);
      setShowNew(false);
    }
  }

  function selectResult(c: CustomerInfo) {
    onSelect(c);
    setQuery("");
    setResults([]);
    setShowNew(false);
    setOpen(false);
  }

  function confirmNew() {
    if (!newName.trim()) return;
    onSelect({ id: null, full_name: newName.trim(), phone: query, member_tier: "new" });
    setQuery("");
    setNewName("");
    setResults([]);
    setShowNew(false);
    setOpen(false);
  }

  // If customer selected — show card
  if (customer) {
    return (
      <div className="flex items-center gap-3 p-3 bg-bg-secondary rounded-xl">
        <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center shrink-0">
          <span className="font-body text-sm text-bg-dark font-semibold">
            {(customer.full_name || customer.phone).charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-body text-sm font-semibold text-text-primary truncate">
            {customer.full_name || t("walk_in_customer")}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="font-body text-xs text-text-muted">{customer.phone}</span>
            <span className={cn("font-body text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase", TIER_COLORS[customer.member_tier] ?? "bg-gray-100 text-gray-600")}>
              {customer.member_tier}
            </span>
            {!customer.id && (
              <span className="font-body text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{t("new_customer_badge")}</span>
            )}
          </div>
        </div>
        <button
          onClick={onClear}
          className="p-1.5 hover:bg-white rounded-lg transition-colors shrink-0"
        >
          <X className="w-3.5 h-3.5 text-text-muted" />
        </button>
      </div>
    );
  }

  // Search input + dropdown
  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex items-center gap-2 px-3 py-2 border border-bg-secondary rounded-xl bg-white focus-within:border-accent transition-colors">
        <Search className="w-4 h-4 text-text-muted shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onFocus={() => query.length >= 2 && setOpen(true)}
          placeholder={placeholder ?? t("search_placeholder")}
          className="flex-1 font-body text-sm text-text-primary bg-transparent outline-none placeholder-text-muted"
        />
        {loading && <span className="text-xs text-text-muted animate-pulse">...</span>}
        {query && !loading && (
          <button onClick={() => { setQuery(""); setResults([]); setShowNew(false); }}>
            <X className="w-3.5 h-3.5 text-text-muted" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || showNew) && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-border rounded-xl shadow-lg overflow-hidden">
          {results.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => selectResult(c)}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-bg-secondary transition-colors text-left"
            >
              <div className="w-7 h-7 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
                <span className="font-body text-xs text-accent font-bold">
                  {(c.full_name || c.phone).charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-body text-sm text-text-primary font-medium truncate">{c.full_name}</p>
                <p className="font-body text-xs text-text-muted">{c.phone}</p>
              </div>
              <span className={cn("font-body text-[10px] px-1.5 py-0.5 rounded-full font-semibold uppercase shrink-0", TIER_COLORS[c.member_tier] ?? "bg-gray-100 text-gray-600")}>
                {c.member_tier}
              </span>
            </button>
          ))}

          {showNew && (
            <div className="border-t border-bg-secondary p-3 space-y-2">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-text-muted" />
                <p className="font-body text-xs text-text-muted">{t("no_results_create")}</p>
              </div>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t("customer_name_placeholder")}
                className="w-full px-3 py-2 border border-bg-secondary rounded-lg font-body text-sm focus:outline-none focus:border-accent"
                onKeyDown={(e) => e.key === "Enter" && confirmNew()}
              />
              <button
                type="button"
                disabled={!newName.trim()}
                onClick={confirmNew}
                className="w-full py-2 rounded-lg bg-accent/10 text-accent font-body text-sm font-medium hover:bg-accent/20 disabled:opacity-40 transition-colors"
              >
                {t("confirm_new_customer")}: {newName || "..."}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Voucher Picker ────────────────────────────────────────────────────────────

function VoucherPicker({
  customerVouchers, selectedCvId, subtotal, onSelect,
}: {
  customerVouchers: CustomerVoucher[];
  selectedCvId: string | null;
  subtotal: number;
  onSelect: (cvId: string | null) => void;
}) {
  return (
    <div className="space-y-2">
      {customerVouchers.map((cv) => {
        if (!cv.voucher) return null;
        const v = cv.voucher;
        const belowMin = v.min_order_amount != null && subtotal < v.min_order_amount;
        const expired = v.expires_at != null && new Date(v.expires_at) < new Date();
        const disabled = belowMin || expired;
        const isSelected = selectedCvId === cv.id;
        const discLabel = v.discount_type === "percent"
          ? `-${v.discount_value}%`
          : `-${formatVND(v.discount_value)}`;

        return (
          <button
            key={cv.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(isSelected ? null : cv.id)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all text-left",
              isSelected
                ? "border-accent bg-accent/5 shadow-sm"
                : disabled
                ? "border-bg-secondary bg-bg-secondary/30 opacity-50 cursor-not-allowed"
                : "border-bg-secondary hover:border-accent/40 hover:bg-bg-secondary/50",
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
              isSelected ? "bg-accent text-bg-dark" : "bg-bg-secondary text-text-muted",
            )}>
              <Tag className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-body text-sm font-semibold text-text-primary">{v.code}</p>
              <p className="font-body text-xs text-text-muted truncate">{v.name}</p>
            </div>
            <div className="text-right shrink-0">
              <p className={cn("font-body text-sm font-bold", isSelected ? "text-accent" : "text-text-secondary")}>
                {discLabel}
              </p>
              {disabled && (
                <p className="font-body text-[10px] text-red-500">
                  {expired ? "Hết hạn" : `Min ${formatVND(v.min_order_amount ?? 0)}`}
                </p>
              )}
              {!disabled && v.min_order_amount && (
                <p className="font-body text-[10px] text-text-muted">min {formatVND(v.min_order_amount)}</p>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// ── Order Line Row ────────────────────────────────────────────────────────────

function OrderLineRow({
  line, index, onChange, onRemove, services, categories,
}: {
  line: OrderLine;
  index: number;
  onChange: (i: number, l: OrderLine) => void;
  onRemove: (i: number) => void;
  services: ServiceOption[];
  categories: { id: string; name: string }[];
}) {
  const t = useTranslations("pos");
  const matched = services.find((s) => s.id === line.service_id);

  const catOptions: SelectOption[] = categories.map((c) => ({ value: c.id, label: c.name }));
  const svcOptions: SelectOption[] = services
    .filter((s) => !line.category_id || s.category_id === line.category_id)
    .map((s) => ({ value: s.id, label: s.name }));

  return (
    <div className="border border-bg-secondary rounded-xl p-3 space-y-2.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        {/* Category */}
        <div className="w-full sm:w-40">
          <CustomSelect
            value={line.category_id ?? ""}
            placeholder={t("all_categories")}
            options={catOptions}
            onChange={(v) => onChange(index, { ...line, category_id: v || null, service_id: null })}
          />
        </div>
        {/* Service */}
        <div className="flex-1 w-full">
          <CustomSelect
            value={line.service_id ?? ""}
            placeholder={t("select_service_placeholder")}
            options={svcOptions}
            onChange={(v) => {
              const svc = services.find((s) => s.id === v);
              onChange(index, {
                ...line,
                service_id: v || null,
                category_id: svc?.category_id ?? line.category_id,
                service_name: svc?.name ?? line.service_name,
                price: svc ? svc.price_min : line.price,
                unit: svc?.unit ?? "fixed",
              });
            }}
          />
        </div>
        <button
          onClick={() => onRemove(index)}
          className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-600 transition-colors shrink-0"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Price + qty */}
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="font-body text-xs text-text-muted">
            {t("price_label")}
            {matched && (
              <span className="ml-1">
                ({t("suggested_price", { min: formatVND(matched.price_min), max: formatVND(matched.price_max) })})
              </span>
            )}
          </label>
          <input
            type="number"
            min={0}
            value={line.price}
            onChange={(e) => onChange(index, { ...line, price: parseInt(e.target.value) || 0 })}
            className={cn(
              "w-full mt-1 border rounded-xl px-3 py-2 font-body text-sm text-text-primary focus:outline-none transition-colors",
              matched && (line.price < matched.price_min || line.price > matched.price_max)
                ? "border-red-400 bg-red-50 focus:border-red-500"
                : "border-bg-secondary focus:border-accent",
            )}
          />
          {matched && (line.price < matched.price_min || line.price > matched.price_max) && (
            <p className="font-body text-[10px] text-red-500 mt-0.5">
              {t("price_out_of_range", { min: formatVND(matched.price_min), max: formatVND(matched.price_max) })}
            </p>
          )}
        </div>
        <div>
          <label className="font-body text-xs text-text-muted">
            {line.unit === "per_nail" ? t("quantity_nails") : t("quantity_label")}
          </label>
          <input
            type="number"
            min={1}
            max={line.unit === "per_nail" ? 10 : undefined}
            value={line.quantity}
            onChange={(e) => onChange(index, { ...line, quantity: parseInt(e.target.value) || 1 })}
            className="w-full mt-1 border border-bg-secondary rounded-xl px-3 py-2 font-body text-sm text-text-primary focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <span className="font-body text-sm font-semibold text-accent">
          {formatVND(line.price * line.quantity)}
        </span>
      </div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────

function SuccessScreen({ total, method, onReset }: { total: number; method: PaymentMethod; onReset: () => void }) {
  const t = useTranslations("pos");
  const labels: Record<PaymentMethod, string> = { cash: t("pay_cash"), transfer: t("pay_transfer"), card: t("pay_card") };
  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-6 p-8">
      <CheckCircle2 className="w-20 h-20 text-green-500" />
      <div className="text-center">
        <p className="font-display text-2xl text-text-primary mb-2">{formatVND(total)}</p>
        <p className="font-body text-sm text-text-muted">{labels[method]}</p>
      </div>
      <p className="font-display text-base text-text-secondary text-center">{t("thank_you")}</p>
      <button
        onClick={onReset}
        className="px-8 py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-medium hover:bg-accent-dark transition-colors"
      >
        {t("new_order")}
      </button>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function POSPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center font-body text-sm text-text-muted animate-pulse">...</div>}>
      <POSContent />
    </Suspense>
  );
}

function POSContent() {
  const t = useTranslations("pos");
  const tAdmin = useTranslations("admin");
  const user = useAuthStore((s) => s.user);
  const searchParams = useSearchParams();

  const [services, setServices] = useState<ServiceOption[]>([]);
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [allStaff, setAllStaff] = useState<StaffMember[]>([]);

  const [lines, setLines] = useState<OrderLine[]>([]);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [customerVouchers, setCustomerVouchers] = useState<CustomerVoucher[]>([]);
  const [vouchersLoading, setVouchersLoading] = useState(false);
  const [selectedCvId, setSelectedCvId] = useState<string | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [discount, setDiscount] = useState(0);

  const [assignedStaffId, setAssignedStaffId] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ total: number; method: PaymentMethod } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load services + categories
  useEffect(() => {
    void fetch("/api/v1/services?active=true")
      .then((r) => r.json())
      .then((j: { data: ServiceWithCategory[] }) => {
        setServices((j.data ?? []).map((s) => ({ ...s, category_id: s.category?.id ?? s.category_id })));
      });
    void fetch("/api/v1/categories")
      .then((r) => r.json())
      .then((j: { data: CategoryRow[] }) => setCategories(j.data ?? []));
  }, []);

  // Load staff list for admin
  useEffect(() => {
    if (user?.role === "admin") {
      void fetch("/api/v1/admin/staff?limit=50")
        .then((r) => r.json())
        .then((j: { data: StaffMember[] }) => setAllStaff(j.data ?? []));
    }
  }, [user]);

  // Default staff to self
  useEffect(() => {
    if (user && !assignedStaffId) setAssignedStaffId(user.id);
  }, [user, assignedStaffId]);

  // Load customer vouchers when customer identified
  useEffect(() => {
    if (!customer?.id) {
      setCustomerVouchers([]);
      setSelectedCvId(null);
      setVoucherCode("");
      setDiscount(0);
      return;
    }
    setVouchersLoading(true);
    void fetch(`/api/v1/vouchers/mine?customer_id=${customer.id}`)
      .then((r) => r.json())
      .then((j: { data: CustomerVoucher[] }) => setCustomerVouchers(j.data ?? []))
      .finally(() => setVouchersLoading(false));
  }, [customer?.id]);

  // Handle URL params (from booking flow)
  useEffect(() => {
    const bId = searchParams.get("booking_id");
    const cPhone = searchParams.get("customer_phone");
    const sId = searchParams.get("staff_id");
    if (bId) setBookingId(bId);
    if (sId) setAssignedStaffId(sId);
    if (cPhone) {
      void fetch(`/api/v1/admin/customers?search=${encodeURIComponent(cPhone)}`)
        .then((r) => r.json())
        .then((j: { data: CustomerInfo[] }) => {
          const found = j.data?.[0];
          if (found) setCustomer(found);
          else setCustomer({ id: null, full_name: searchParams.get("customer_name") ?? "", phone: cPhone, member_tier: "new" });
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const subtotal = lines.reduce((s, l) => s + l.price * l.quantity, 0);

  // Recalculate percent discount when subtotal changes
  useEffect(() => {
    if (!selectedCvId) return;
    const cv = customerVouchers.find((v) => v.id === selectedCvId);
    if (!cv?.voucher) return;
    if (cv.voucher.discount_type === "percent") {
      setDiscount(Math.round(subtotal * cv.voucher.discount_value / 100));
    }
  }, [subtotal, selectedCvId, customerVouchers]);

  const total = Math.max(0, subtotal - discount);

  function selectVoucher(cvId: string | null) {
    setSelectedCvId(cvId);
    if (!cvId) { setDiscount(0); setVoucherCode(""); return; }
    const cv = customerVouchers.find((v) => v.id === cvId);
    if (!cv?.voucher) return;
    setVoucherCode(cv.voucher.code);
    if (cv.voucher.discount_type === "percent") {
      setDiscount(Math.round(subtotal * cv.voucher.discount_value / 100));
    } else {
      setDiscount(cv.voucher.discount_value);
    }
  }

  function addLine() {
    setLines((p) => [...p, { category_id: null, service_id: null, service_name: "", price: 0, quantity: 1, unit: "fixed", note: "" }]);
  }
  function updateLine(i: number, l: OrderLine) {
    setLines((p) => p.map((item, idx) => (idx === i ? l : item)));
  }
  function removeLine(i: number) {
    setLines((p) => p.filter((_, idx) => idx !== i));
  }

  async function submit() {
    if (lines.length === 0) { setError(t("no_services_error")); return; }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          booking_id: bookingId,
          customer_id: customer?.id ?? null,
          staff_id: assignedStaffId || user?.id || null,
          items: lines.map((l) => ({
            service_id: l.service_id,
            service_name: l.service_name || t("service_fallback"),
            price: l.price,
            quantity: l.quantity,
            unit: l.unit,
          })),
          method,
          voucher_code: voucherCode || undefined,
        }),
      });
      const json = (await res.json()) as { data: { total: number } | null; error: { message: string } | null };
      if (!res.ok || json.error) throw new Error(json.error?.message ?? "Error");
      setSuccess({ total: json.data?.total ?? total, method });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setLines([]);
    setCustomer(null);
    setCustomerVouchers([]);
    setSelectedCvId(null);
    setVoucherCode("");
    setDiscount(0);
    setSuccess(null);
    setError(null);
    setBookingId(null);
  }

  if (success) return <SuccessScreen total={success.total} method={success.method} onReset={reset} />;

  const staffOptions: SelectOption[] = allStaff.map((s) => ({
    value: s.id,
    label: s.full_name || s.phone,
  }));

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* LEFT */}
      <div className="flex-1 space-y-4">
        <h2 className="font-display text-lg text-text-primary">{t("title")}</h2>

        {/* Customer */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-4 space-y-3">
          <p className="font-body text-xs font-semibold text-text-muted uppercase tracking-wide">{t("section_customer")}</p>
          <CustomerSearchBox
            customer={customer}
            onSelect={setCustomer}
            onClear={() => setCustomer(null)}
            placeholder={tAdmin("search_customer")}
          />
        </div>

        {/* Services */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-4 space-y-3">
          <p className="font-body text-xs font-semibold text-text-muted uppercase tracking-wide">{t("section_services")}</p>
          {lines.map((line, i) => (
            <OrderLineRow
              key={i}
              line={line}
              index={i}
              onChange={updateLine}
              onRemove={removeLine}
              services={services}
              categories={categories}
            />
          ))}
          <button
            onClick={addLine}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-accent text-accent font-body text-sm hover:bg-accent/5 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t("add_service")}
          </button>
        </div>

        {/* Voucher */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Tag className="w-3.5 h-3.5 text-text-muted" />
            <p className="font-body text-xs font-semibold text-text-muted uppercase tracking-wide">Voucher</p>
            {selectedCvId && discount > 0 && (
              <span className="ml-auto font-body text-xs text-green-600 font-semibold">-{formatVND(discount)}</span>
            )}
          </div>
          {!customer?.id ? (
            <p className="font-body text-xs text-text-muted italic">{t("select_customer_for_voucher")}</p>
          ) : vouchersLoading ? (
            <div className="flex gap-2 items-center py-1">
              <div className="h-10 bg-bg-secondary rounded-xl flex-1 animate-pulse" />
              <div className="h-10 bg-bg-secondary rounded-xl w-24 animate-pulse" />
            </div>
          ) : customerVouchers.length === 0 ? (
            <p className="font-body text-xs text-text-muted italic">{t("no_vouchers")}</p>
          ) : (
            <VoucherPicker
              customerVouchers={customerVouchers}
              selectedCvId={selectedCvId}
              subtotal={subtotal}
              onSelect={selectVoucher}
            />
          )}
        </div>

        {/* Staff */}
        <div className="bg-white rounded-2xl border border-bg-secondary p-4 space-y-3">
          <p className="font-body text-xs font-semibold text-text-muted uppercase tracking-wide">{t("section_staff")}</p>
          {user?.role === "admin" ? (
            <CustomSelect
              value={assignedStaffId ?? ""}
              placeholder={t("select_staff_placeholder")}
              options={staffOptions}
              onChange={setAssignedStaffId}
            />
          ) : (
            <div className="flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-xl">
              <UserCheck className="w-4 h-4 text-accent" />
              <span className="font-body text-sm text-text-primary">{user?.full_name || user?.phone}</span>
            </div>
          )}
          <p className="font-body text-[10px] text-text-muted italic">
            * {user?.role === "admin" ? t("commission_note_admin") : t("commission_note_staff")}
          </p>
        </div>
      </div>

      {/* RIGHT — Bill */}
      <div className="lg:w-72 xl:w-80 shrink-0">
        <div className="bg-white rounded-2xl border border-bg-secondary p-5 space-y-4 sticky top-4">
          <div className="text-center border-b border-bg-secondary pb-4">
            <p className="font-display text-base text-text-primary">Hanie Studio</p>
            <p className="font-body text-xs text-text-muted">55 Nguyễn Nhạc, Quy Nhơn</p>
            <p className="font-body text-xs text-text-muted mt-1">{format(new Date(), "dd/MM/yyyy HH:mm")}</p>
            {customer && <p className="font-body text-xs text-text-secondary mt-1">{customer.full_name}</p>}
          </div>

          <div className="space-y-2 min-h-[60px]">
            {lines.length === 0 && (
              <p className="font-body text-xs text-text-muted text-center py-4">{t("no_service_lines")}</p>
            )}
            {lines.map((l, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="font-body text-sm text-text-primary truncate">
                  {l.service_name || t("service_fallback")}{l.quantity > 1 ? ` ×${l.quantity}` : ""}
                </span>
                <span className="font-body text-sm text-text-secondary shrink-0">
                  {formatVND(l.price * l.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-bg-secondary pt-3 space-y-1">
            <div className="flex justify-between font-body text-sm text-text-secondary">
              <span>{t("subtotal")}</span><span>{formatVND(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between font-body text-sm text-green-600">
                <span>{t("discount")}</span><span>-{formatVND(discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-display text-lg text-text-primary pt-1">
              <span>{t("total")}</span><span>{formatVND(total)}</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {(["cash", "transfer", "card"] as PaymentMethod[]).map((m) => (
              <button
                key={m}
                onClick={() => setMethod(m)}
                className={cn(
                  "py-2.5 rounded-xl font-body text-xs font-medium border transition-colors",
                  method === m
                    ? "bg-accent border-accent text-bg-dark"
                    : "border-bg-secondary text-text-secondary hover:bg-bg-secondary",
                )}
              >
                {m === "cash" ? t("pay_cash") : m === "transfer" ? t("pay_transfer") : t("pay_card")}
              </button>
            ))}
          </div>

          {error && <p className="font-body text-xs text-red-600 text-center">{error}</p>}

          <button
            onClick={() => void submit()}
            disabled={submitting || lines.length === 0}
            className="w-full py-3 rounded-xl bg-accent text-bg-dark font-body text-sm font-semibold hover:bg-accent-dark disabled:opacity-50 transition-colors"
          >
            {submitting ? t("processing") : t("confirm_payment")}
          </button>
        </div>
      </div>
    </div>
  );
}
