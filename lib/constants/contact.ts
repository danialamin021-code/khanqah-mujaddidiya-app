/**
 * Contact details for the Contact page.
 * Set these in .env.local for production:
 *   NEXT_PUBLIC_CONTACT_PHONE
 *   NEXT_PUBLIC_CONTACT_EMAIL
 *   NEXT_PUBLIC_CONTACT_WHATSAPP
 */

export const CONTACT = {
  phone: process.env.NEXT_PUBLIC_CONTACT_PHONE ?? "+1234567890",
  email: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "contact@example.com",
  whatsapp: process.env.NEXT_PUBLIC_CONTACT_WHATSAPP ?? "https://wa.me/1234567890",
} as const;
