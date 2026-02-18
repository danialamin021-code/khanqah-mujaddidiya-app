const PLACEHOLDER_PHONE = "+1234567890";
const PLACEHOLDER_EMAIL = "contact@example.com";
const PLACEHOLDER_WHATSAPP = "https://wa.me/1234567890";

export default function ContactPage() {
  return (
    <main className="min-h-full px-6 py-8 md:py-10">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-heading text-2xl font-normal text-deep-green">
          Contact
        </h1>
        <p className="mt-2 text-foreground/80">
          Reach out when you are ready. No forms—just direct contact.
        </p>

        <div className="mt-10 space-y-4 stagger">
          <a
            href={PLACEHOLDER_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4 rounded-2xl border border-green-soft bg-light-green/50 p-5 shadow-sm transition-colors duration-200 hover:bg-light-green"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-lg font-medium text-[#25D366]">
              WA
            </span>
            <div>
              <span className="font-medium text-deep-green">WhatsApp</span>
              <p className="mt-0.5 text-sm text-foreground/70">One-tap to open WhatsApp</p>
            </div>
          </a>

          <a
            href={`tel:${PLACEHOLDER_PHONE}`}
            className="flex items-center gap-4 rounded-2xl border border-green-soft bg-light-green/50 p-5 shadow-sm transition-colors duration-200 hover:bg-light-green"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light-green text-lg font-medium text-deep-green">
              📞
            </span>
            <div>
              <span className="font-medium text-deep-green">Phone</span>
              <p className="mt-0.5 text-sm text-foreground/70">One-tap to call</p>
            </div>
          </a>

          <a
            href={`mailto:${PLACEHOLDER_EMAIL}`}
            className="flex items-center gap-4 rounded-2xl border border-green-soft bg-light-green/50 p-5 shadow-sm transition-colors duration-200 hover:bg-light-green"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-light-green text-lg font-medium text-deep-green">
              ✉
            </span>
            <div>
              <span className="font-medium text-deep-green">Email</span>
              <p className="mt-0.5 text-sm text-foreground/70">{PLACEHOLDER_EMAIL}</p>
            </div>
          </a>
        </div>

        <p className="mt-8 text-sm text-foreground/60">
          Replace the placeholder values in the code with your real contact details when ready.
        </p>
      </div>
    </main>
  );
}
