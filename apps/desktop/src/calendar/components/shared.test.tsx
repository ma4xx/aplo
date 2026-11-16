import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@iconify-icon/react", () => ({ Icon: () => null }));
vi.mock("@anlg/ui/components/icons/outlook", () => ({
  OutlookIcon: () => null,
}));

async function providerIds(accounts: boolean) {
  vi.resetModules();
  vi.doMock("~/shared/features", () => ({ ACCOUNTS_ENABLED: accounts }));
  const { PROVIDERS } = await import("./shared");
  return PROVIDERS.map((provider) => provider.id as string);
}

describe("calendar providers", () => {
  afterEach(() => {
    vi.doUnmock("~/shared/features");
    vi.resetModules();
  });

  it("offers only Apple Calendar without accounts", async () => {
    expect(await providerIds(false)).toEqual(["apple"]);
  });

  it("offers Google and Outlook again when accounts are on", async () => {
    expect(await providerIds(true)).toEqual(["apple", "google", "outlook"]);
  });
});
