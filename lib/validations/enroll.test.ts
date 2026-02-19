import { describe, it, expect } from "vitest";
import { enrollFormSchema } from "./enroll";

describe("enrollFormSchema", () => {
  it("accepts valid input", () => {
    const result = enrollFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      niyahChecked: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects short full name", () => {
    const result = enrollFormSchema.safeParse({
      fullName: "J",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      niyahChecked: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid whatsapp", () => {
    const result = enrollFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "123",
      country: "Pakistan",
      city: "Lahore",
      niyahChecked: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects unchecked niyah", () => {
    const result = enrollFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      niyahChecked: false,
    });
    expect(result.success).toBe(false);
  });
});
