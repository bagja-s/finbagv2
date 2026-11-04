import { describe, it, expect } from "vitest";
import { cn } from "@/lib/utils/helpers";
import { formatCurrency, formatDate, formatRelativeTime } from "@/lib/utils/helpers";

describe("Utility Functions", () => {
  describe("cn", () => {
    it("joins class names", () => {
      expect(cn("foo", "bar")).toBe("foo bar");
    });

    it("handles conditional classes", () => {
      expect(cn("foo", true && "bar", false && "baz")).toBe("foo bar");
    });

    it("handles tailwind merge", () => {
      expect(cn("p-2 p-4")).toBe("p-4");
    });
  });

  describe("formatCurrency", () => {
    it("formats IDR correctly", () => {
      expect(formatCurrency(1000000, "IDR", "id-ID")).toContain("Rp");
      expect(formatCurrency(1000000, "IDR", "id-ID")).toContain("1.000.000");
    });

    it("formats USD correctly", () => {
      expect(formatCurrency(1000, "USD", "en-US")).toContain("$");
      expect(formatCurrency(1000, "USD", "en-US")).toContain("1,000");
    });

    it("handles zero", () => {
      expect(formatCurrency(0, "IDR", "id-ID")).toContain("Rp");
      expect(formatCurrency(0, "IDR", "id-ID")).toContain("0");
    });
  });

  describe("formatDate", () => {
    it("formats date in Indonesian locale", () => {
      const result = formatDate("2024-01-15", "id-ID");
      expect(result).toContain("15");
      expect(result).toContain("Januari");
      expect(result).toContain("2024");
    });

    it("formats date in English locale", () => {
      const result = formatDate("2024-01-15", "en-US");
      expect(result).toContain("January");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("formatRelativeTime", () => {
    it("shows 'just now' for recent dates", () => {
      const now = new Date().toISOString();
      expect(formatRelativeTime(now, "id")).toBe("Baru saja");
      expect(formatRelativeTime(now, "en")).toBe("Just now");
    });

    it("shows minutes ago", () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      expect(formatRelativeTime(fiveMinutesAgo, "id")).toContain("menit lalu");
      expect(formatRelativeTime(fiveMinutesAgo, "en")).toContain("minutes ago");
    });

    it("shows hours ago", () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(twoHoursAgo, "id")).toContain("jam lalu");
      expect(formatRelativeTime(twoHoursAgo, "en")).toContain("hours ago");
    });

    it("shows days ago", () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      expect(formatRelativeTime(threeDaysAgo, "id")).toContain("hari lalu");
      expect(formatRelativeTime(threeDaysAgo, "en")).toContain("days ago");
    });
  });
});