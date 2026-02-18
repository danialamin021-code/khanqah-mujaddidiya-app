"use client";

import { useState } from "react";
import { submitGuidanceRequest } from "@/app/actions/guidance-requests";
import { guidanceFormSchema } from "@/lib/validations/guidance";

const COUNTRY_OPTIONS = ["Select country", "Pakistan", "United Kingdom", "United States", "Canada", "Other"];
const CITY_OPTIONS = ["Select city", "Lahore", "Karachi", "London", "New York", "Other"];

export default function GuidanceRequestForm() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fullName, setFullName] = useState("");
  const [whatsApp, setWhatsApp] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const parsed = guidanceFormSchema.safeParse({
      fullName,
      whatsapp: whatsApp,
      country,
      city,
      message: message || undefined,
    });
    if (!parsed.success) {
      const first = parsed.error.flatten().fieldErrors;
      const msg =
        first.fullName?.[0] ??
        first.whatsapp?.[0] ??
        first.country?.[0] ??
        first.city?.[0] ??
        first.message?.[0] ??
        "Please fix the form errors.";
      setError(msg);
      return;
    }

    setLoading(true);
    try {
      const result = await submitGuidanceRequest({
        fullName: parsed.data.fullName,
        whatsapp: parsed.data.whatsapp,
        country: parsed.data.country,
        city: parsed.data.city,
        message: parsed.data.message,
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
      <div className="rounded-2xl border border-green-soft bg-light-green/50 p-6">
        <p className="font-heading text-lg font-normal text-deep-green">Request received</p>
        <p className="mt-2 text-sm text-foreground/80">
          Thank you. Your guidance request has been received. The Sheikh or his team will contact you. There is no instant confirmation — all requests are reviewed with care.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-4 rounded-2xl border border-green-soft bg-light-green/50 p-6">
      <h2 className="font-heading text-lg font-normal text-deep-green">Request Guidance</h2>
      <p className="text-sm text-foreground/70">
        Submit your details. You will be contacted after review.
      </p>
      <div>
        <label htmlFor="guidance-name" className="block text-sm font-medium text-deep-green/90">
          Full Name <span className="text-foreground/60">(required)</span>
        </label>
        <input
          id="guidance-name"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
        />
      </div>
      <div>
        <label htmlFor="guidance-whatsapp" className="block text-sm font-medium text-deep-green/90">
          WhatsApp Number <span className="text-foreground/60">(required)</span>
        </label>
        <input
          id="guidance-whatsapp"
          type="tel"
          value={whatsApp}
          onChange={(e) => setWhatsApp(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
          placeholder="+92 300 1234567"
        />
      </div>
      <div>
        <label htmlFor="guidance-country" className="block text-sm font-medium text-deep-green/90">
          Country
        </label>
        <select
          id="guidance-country"
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
        <label htmlFor="guidance-city" className="block text-sm font-medium text-deep-green/90">
          City
        </label>
        <select
          id="guidance-city"
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
        <label htmlFor="guidance-message" className="block text-sm font-medium text-deep-green/90">
          Message (optional)
        </label>
        <textarea
          id="guidance-message"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="mt-1 w-full rounded-lg border border-green-soft bg-[var(--background)] px-3 py-2 text-foreground"
          placeholder="Briefly describe what you seek guidance on..."
        />
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-muted-gold px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gold-hover disabled:opacity-60"
      >
        {loading ? "Submitting…" : "Submit Request"}
      </button>
    </form>
  );
}
