import { afterEach, describe, expect, it, vi } from "vitest";

async function providerIds(hostedModelsEnabled: boolean) {
  vi.resetModules();
  vi.doMock("~/shared/features", () => ({
    HOSTED_MODELS_ENABLED: hostedModelsEnabled,
  }));
  const stt = await import("./stt/shared");
  const llm = await import("./llm/shared");
  return {
    stt: stt.PROVIDERS.map((provider) => provider.id as string),
    llm: llm.PROVIDERS.map((provider) => provider.id as string),
  };
}

describe("hosted model providers", () => {
  afterEach(() => {
    vi.doUnmock("~/shared/features");
    vi.resetModules();
  });

  it("are not offered for transcription or language models without accounts", async () => {
    const ids = await providerIds(false);

    expect(ids.stt).not.toContain("anarlog");
    expect(ids.llm).not.toContain("anarlog");
    expect(ids.stt).toContain("deepgram");
    expect(ids.llm).toContain("openai");
  }, 60_000);

  it("come back when the switch is turned on", async () => {
    const ids = await providerIds(true);

    expect(ids.stt).toContain("anarlog");
    expect(ids.llm).toContain("anarlog");
  }, 60_000);
});
