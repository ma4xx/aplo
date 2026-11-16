import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tauri-apps/plugin-os", () => ({ platform: () => "macos" }));

async function steps(flags: { accounts: boolean; imports: boolean }) {
  vi.resetModules();
  vi.doMock("~/shared/features", () => ({
    ACCOUNTS_ENABLED: flags.accounts,
    IMPORTS_ENABLED: flags.imports,
  }));
  const config = await import("./config");
  const order: string[] = [config.getInitialStep()];
  for (let next = config.getNextStep(order[0] as never); next; ) {
    order.push(next);
    next = config.getNextStep(next);
  }
  return order;
}

describe("onboarding steps", () => {
  afterEach(() => {
    vi.doUnmock("~/shared/features");
    vi.resetModules();
  });

  it("skips sign-in and meeting-history import while those are off", async () => {
    expect(await steps({ accounts: false, imports: false })).toEqual([
      "permissions",
      "calendar",
      "final",
    ]);
  });

  it("brings both steps back when their switches are on", async () => {
    expect(await steps({ accounts: true, imports: true })).toEqual([
      "permissions",
      "login",
      "calendar",
      "imports",
      "final",
    ]);
  });
});
