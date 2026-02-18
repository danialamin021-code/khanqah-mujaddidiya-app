import { z } from "zod";

const whatsappRegex = /^\+?[\d\s\-()]{10,20}$/;

export const bayatFormSchema = z.object({
  fullName: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(120, "Full name must be at most 120 characters")
    .trim(),
  whatsapp: z
    .string()
    .min(10, "WhatsApp number must be at least 10 digits")
    .regex(whatsappRegex, "Invalid WhatsApp number format"),
  country: z.string().min(1, "Please select a country"),
  city: z.string().min(1, "Please select a city"),
  checkbox1: z.literal(true, { error: "You must accept the first declaration" }),
  checkbox2: z.literal(true, { error: "You must accept the second declaration" }),
});
