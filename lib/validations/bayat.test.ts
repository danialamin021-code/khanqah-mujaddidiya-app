import { describe, it, expect } from "vitest";
import { bayatFormSchema } from "./bayat";

describe("bayatFormSchema", () => {
  it("accepts valid input", () => {
    const result = bayatFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      checkbox1: true,
      checkbox2: true,
    });
    expect(result.success).toBe(true);
  });

  it("rejects short full name", () => {
    const result = bayatFormSchema.safeParse({
      fullName: "J",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      checkbox1: true,
      checkbox2: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid whatsapp", () => {
    const result = bayatFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "123",
      country: "Pakistan",
      city: "Lahore",
      checkbox1: true,
      checkbox2: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects unchecked checkbox1", () => {
    const result = bayatFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "Pakistan",
      city: "Lahore",
      checkbox1: false,
      checkbox2: true,
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty country", () => {
    const result = bayatFormSchema.safeParse({
      fullName: "John Doe",
      whatsapp: "+92 300 1234567",
      country: "",
      city: "Lahore",
      checkbox1: true,
      checkbox2: true,
    });
    expect(result.success).toBe(false);
  });
});
