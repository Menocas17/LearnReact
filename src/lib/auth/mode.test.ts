import { afterEach, describe, expect, it, vi } from "vitest";
import { getAuthMode, isEmailAllowed } from "./mode";

afterEach(() => vi.unstubAllEnvs());

describe("getAuthMode", () => {
  it("usa local por defecto en desarrollo", () => {
    vi.stubEnv("NODE_ENV", "development");
    vi.stubEnv("AUTH_MODE", "");
    expect(getAuthMode()).toBe("local");
  });

  it("en producción exige GitHub salvo local explícito sin DATABASE_URL", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("AUTH_MODE", "");
    expect(getAuthMode()).toBe("github");
    vi.stubEnv("AUTH_MODE", "local");
    vi.stubEnv("DATABASE_URL", "");
    expect(getAuthMode()).toBe("local");
    vi.stubEnv("DATABASE_URL", "postgres://x");
    expect(getAuthMode()).toBe("github");
  });
});

describe("isEmailAllowed", () => {
  it("compara sin distinguir mayúsculas", () => {
    vi.stubEnv("ALLOWED_EMAILS", "Yo@Ejemplo.com, otro@x.com");
    expect(isEmailAllowed("yo@ejemplo.com")).toBe(true);
    expect(isEmailAllowed("nadie@x.com")).toBe(false);
  });
});
