import { describe, it, expect } from "vitest";
import { guidanceFormSchema } from "./guidance";

describe("guidanceFormSchema", () => {
  it("accepts valid input without message", () => {
    const result = guidanceFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
    });
    expect(result.success).toBe(true);
  });

  it("accepts valid input with message", () => {
    const result = guidanceFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      message: "I need guidance on spiritual matters.",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short full name", () => {
    const result = guidanceFormSchema.safeParse({
      fullName: "J",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid whatsapp", () => {
    const result = guidanceFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "123",
      country: "Pakistan",
      city: "Lahore",
    });
    expect(result.success).toBe(false);
  });

  it("rejects message over 500 characters", () => {
    const result = guidanceFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      message: "x".repeat(501),
    });
    expect(result.success).toBe(false);
  });
});
