"use client";

import { useState } from "react";
import { enrollInBatch } from "@/lib/actions/batch-enrollment";
import { enrollFormSchema } from "@/lib/validations/enroll";

const NIYAH_TEXT =
  "I sincerely intend to seek knowledge with full dedication, commitment, and reflection, solely to attain closeness to Allah.";

const COUNTRY_OPTIONS = ["Select country", "Pakistan", "United Kingdom", "United States", "Canada", "Other"];
const CITY_OPTIONS = ["Select city", "Lahore", "Karachi", "London", "New York", "Other"];

export default function BatchEnrollModal({
  batchName,
  batchId,
  whatsappGroupLink,
  onClose,
  onSuccess,
}: {
  batchName: string;
  batchId: string;
  whatsappGroupLink: string | null;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [niyahChecked, setNiyahChecked] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = enrollFormSchema.safeParse({
      fullName,
      whatsapp: whatsApp,
      country,
      city,
      niyahChecked,
    });
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        first.fullName?.[0] ??
        first.whatsapp?.[0] ??
        first.country?.[0] ??
        first.city?.[0] ??
        first.niyahChecked?.[0] ??
        "Please fix the form errors.";
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      const result = await enrollInBatch(batchId, {
        fullName: parsed.data.fullName,
        whatsapp: parsed.data.whatsapp,
        country: parsed.data.country,
        city: parsed.data.city,
      });
      if (result.success) {
        setSubmitted(true);
        onSuccess?.();
      } else {
        setError(result.error ?? "Enrollment failed. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
        <div
          className="w-full max-w-md rounded-2xl border border-green-soft bg-[var(--background)] p-6 shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="font-heading text-lg font-normal text-deep-green">Enrollment successful</p>
          <p className="mt-2 text-sm text-foreground/80">
            Welcome to {batchName}. You can access sessions, attendance, and participation from the batch page.
          </p>
          {whatsappGroupLink && (
            <div className="mt-4 rounded-lg border border-green-soft bg-light-green/30 p-4">
              <p className="text-sm font-medium text-deep-green/90">WhatsApp Group</p>
              <a
                href={whatsappGroupLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block truncate text-sm text-muted-gold hover:underline"
              >
                {whatsappGroupLink}
              </a>
              <p className="mt-2 text-xs text-foreground/70">
                Join the group to stay updated. The link is also available on the batch page.
              </p>
            </div>
          )}
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-muted-gold py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-hover"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-md rounded-2xl border border-green-soft bg-[var(--background)] p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-heading text-lg font-normal text-deep-green">Enroll — {batchName}</h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="batch-enroll-name" className="block text-sm font-medium text-deep-green/90">
              Full Name <span className="text-foreground/60">(required)</span>
            </label>
            <input
              id="batch-enroll-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label htmlFor="batch-enroll-whatsapp" className="block text-sm font-medium text-deep-green/90">
              WhatsApp Number <span className="text-foreground/60">(required)</span>
            </label>
            <input
              id="batch-enroll-whatsapp"
              type="tel"
              required
              value={whatsApp}
              onChange={(e) => setWhatsApp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <label htmlFor="batch-enroll-country" className="block text-sm font-medium text-deep-green/90">
              Country
            </label>
            <select
              id="batch-enroll-country"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
            >
              {COUNTRY_OPTIONS.map((opt) => (
                <option key={opt} value={opt === "Select country" ? "" : opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="batch-enroll-city" className="block text-sm font-medium text-deep-green/90">
              City
            </label>
            <select
              id="batch-enroll-city"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
            >
              {CITY_OPTIONS.map((opt) => (
                <option key={opt} value={opt === "Select city" ? "" : opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="flex gap-3 text-sm text-deep-green/90">
              <input
                type="checkbox"
                required
                checked={niyahChecked}
                onChange={(e) => setNiyahChecked(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-green-soft text-muted-gold focus:ring-deep-green"
              />
              <span className="leading-relaxed">
                {NIYAH_TEXT} <span className="text-foreground/60">(required)</span>
              </span>
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-muted-gold py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-hover disabled:opacity-60"
            >
              {loading ? "Enrolling…" : "Submit"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-green-soft py-2.5 px-4 text-sm font-medium text-deep-green hover:bg-light-green/50 disabled:opacity-60"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
