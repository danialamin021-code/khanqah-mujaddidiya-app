"use client";

import { useState } from "react";
import { submitBayatRequest } from "@/app/actions/bayat-requests";
import { bayatFormSchema } from "@/lib/validations/bayat";

const CHECKBOX_1_TEXT =
  "I make this bay‘ah purely and sincerely for the sake of Allah alone, seeking His pleasure, guidance, and nearness, without any worldly intention.";
const CHECKBOX_2_TEXT =
  "I have read and fully understood the explanation and responsibility of Bay‘ah.";

/** Placeholder options — replace with API/country list later. */
const COUNTRY_OPTIONS = ["Select country", "Pakistan", "United Kingdom", "United States", "Canada", "Other"];
const CITY_OPTIONS = ["Select city", "Lahore", "Karachi", "London", "New York", "Other"];

/**
 * Bayat request form. Persists to bayat_requests; admin reviews at /admin/requests.
 */
export default function BayatModal({ onClose }: { onClose: () => void }) {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = bayatFormSchema.safeParse({
      fullName,
      whatsapp: whatsApp,
      country,
      city,
      checkbox1,
      checkbox2,
    });
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        first.fullName?.[0] ??
        first.whatsapp?.[0] ??
        first.country?.[0] ??
        first.city?.[0] ??
        first.checkbox1?.[0] ??
        first.checkbox2?.[0] ??
        "Please fix the form errors.";
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      const result = await submitBayatRequest({
        fullName: parsed.data.fullName,
        whatsapp: parsed.data.whatsapp,
        country: parsed.data.country,
        city: parsed.data.city,
      });
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error ?? "Request failed. Please try again.");
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
          <p className="font-heading text-lg font-normal text-deep-green">
            Request received
          </p>
          <p className="mt-2 text-sm text-foreground/80">
            Thank you. Your Bayat request has been received. The Sheikh or his team will contact you. There is no instant confirmation — all requests are reviewed with care.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="mt-6 w-full rounded-lg bg-muted-gold py-2.5 text-sm font-medium text-white hover:bg-gold-hover"
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
        <h2 className="font-heading text-lg font-normal text-deep-green">
          Request Bayat
        </h2>
        <p className="mt-1 text-sm text-foreground/70">
          Submit your details. You will be contacted after review.
        </p>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="bayat-name" className="block text-sm font-medium text-deep-green/90">
              Full Name <span className="text-foreground/60">(required)</span>
            </label>
            <input
              id="bayat-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
            />
          </div>
          <div>
            <label htmlFor="bayat-whatsapp" className="block text-sm font-medium text-deep-green/90">
              WhatsApp Number <span className="text-foreground/60">(required)</span>
            </label>
            <input
              id="bayat-whatsapp"
              type="tel"
              required
              value={whatsApp}
              onChange={(e) => setWhatsApp(e.target.value)}
              className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
              placeholder="+92 300 1234567"
            />
          </div>
          <div>
            <label htmlFor="bayat-country" className="block text-sm font-medium text-deep-green/90">
              Country
            </label>
            <select
              id="bayat-country"
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
            <label htmlFor="bayat-city" className="block text-sm font-medium text-deep-green/90">
              City
            </label>
            <select
              id="bayat-city"
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
                checked={checkbox1}
                onChange={(e) => setCheckbox1(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-green-soft text-muted-gold focus:ring-deep-green"
              />
              <span className="leading-relaxed">{CHECKBOX_1_TEXT} <span className="text-foreground/60">(required)</span></span>
            </label>
          </div>
          <div>
            <label className="flex gap-3 text-sm text-deep-green/90">
              <input
                type="checkbox"
                required
                checked={checkbox2}
                onChange={(e) => setCheckbox2(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 rounded border-green-soft text-muted-gold focus:ring-deep-green"
              />
              <span className="leading-relaxed">{CHECKBOX_2_TEXT} <span className="text-foreground/60">(required)</span></span>
            </label>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-lg bg-muted-gold py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-hover disabled:opacity-60"
            >
              {loading ? "Submitting…" : "Submit"}
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
