import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  sharing: false,
  resources: [
    {
      shareId: "share-1",
      resourceType: "template",
      title: "Weekly sync template",
      accessKind: "member",
      workspaceName: "Acme",
      ownerEmail: "owner@example.com",
      payload: {},
    },
  ] as unknown[],
  auth: { session: { user: { id: "user-1" } } } as unknown,
}));

vi.mock("~/shared/features", () => ({
  get SHARING_ENABLED() {
    return mocks.sharing;
  },
}));

vi.mock("~/auth", () => ({
  useOptionalAuth: () => mocks.auth,
  useAuth: () => mocks.auth,
}));

vi.mock("~/auth/billing-context", () => ({
  useBillingAccess: () => ({ isPro: true, isPaid: true, isReady: true }),
}));

vi.mock("~/session-sharing/source", () => ({
  useAvailableShareWorkspaces: () => [],
}));

vi.mock("~/resource-sharing/hooks", () => ({
  sharedResourcesQueryKey: () => ["shared-resources"],
  useSharedResources: () => ({ data: mocks.resources }),
}));

vi.mock("~/store/zustand/tabs", () => ({
  useTabs: (selector: (state: { openNew: () => void }) => unknown) =>
    selector({ openNew: () => {} }),
}));

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { SharedResourceLibrarySection } from "~/resource-sharing/library";
import { ResourceShareButton } from "~/resource-sharing/share-dialog";

function wrap(node: React.ReactNode) {
  const client = new QueryClient();
  return <QueryClientProvider client={client}>{node}</QueryClientProvider>;
}

describe("sharing switch", () => {
  beforeEach(() => {
    mocks.sharing = false;
    mocks.auth = { session: { user: { id: "user-1" } } };
  });

  afterEach(() => cleanup());

  it("hides the resource share button even for a signed-in user", () => {
    render(
      wrap(
        <ResourceShareButton
          resourceType="template"
          sourceId="t1"
          title="Standup"
          buildPayload={() => ({})}
        />,
      ),
    );

    expect(screen.queryByRole("button", { name: /Share/ })).toBeNull();
  });

  it("shows the resource share button again when sharing is switched on", () => {
    mocks.sharing = true;
    render(
      wrap(
        <ResourceShareButton
          resourceType="template"
          sourceId="t1"
          title="Standup"
          buildPayload={() => ({})}
        />,
      ),
    );

    expect(screen.getByRole("button", { name: /Share/ })).toBeTruthy();
  });

  it("hides the shared library section even when someone shared a template with the user", () => {
    const { container } = render(
      wrap(
        <SharedResourceLibrarySection
          resourceType="template"
          onImport={async () => {}}
        />,
      ),
    );

    expect(container.textContent).not.toContain("Weekly sync template");
  });

  it("shows that shared template again when sharing is switched on", () => {
    mocks.sharing = true;
    const { container } = render(
      wrap(
        <SharedResourceLibrarySection
          resourceType="template"
          onImport={async () => {}}
        />,
      ),
    );

    expect(container.textContent).toContain("Weekly sync template");
  });
});
