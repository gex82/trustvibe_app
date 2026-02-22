import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AdminCasesScreen from "../AdminCasesScreen";

const mocks = vi.hoisted(() => ({
  runtimeMode: "live" as "live" | "mock",
  collectionState: {
    rows: [] as Array<Record<string, unknown>>,
    loading: false,
    error: null as string | null,
    refresh: vi.fn(async () => undefined),
  },
  executeSpy: vi.fn(),
}));

vi.mock("../../../hooks/useCollectionData", () => ({
  useCollectionData: () => mocks.collectionState,
}));

vi.mock("../../../context/RuntimeContext", () => ({
  useRuntime: () => ({
    dataMode: mocks.runtimeMode,
    backendReachable: true,
    autoFallback: false,
    setDataMode: vi.fn(),
    recheckBackend: vi.fn(async () => true),
  }),
}));

vi.mock("../../../context/AppContext", () => ({
  useApp: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("../../../services/api", () => ({
  adminExecuteOutcome: (payload: unknown) => mocks.executeSpy(payload),
}));

describe("AdminCasesScreen", () => {
  beforeEach(() => {
    mocks.runtimeMode = "live";
    mocks.collectionState.rows = [];
    mocks.collectionState.loading = false;
    mocks.collectionState.error = null;
    mocks.collectionState.refresh.mockClear();
    mocks.executeSpy.mockClear();
    mocks.executeSpy.mockResolvedValue(undefined);
  });

  it("renders live rows and executes outcome action", async () => {
    mocks.runtimeMode = "live";
    mocks.collectionState.rows = [
      {
        id: "case-live-1",
        projectId: "proj-live-1",
        projectTitle: "Roof repair dispute",
        customerName: "Maria",
        contractorName: "Juan",
        heldAmountCents: 280000,
        status: "OPEN",
        description: "Dispute summary",
        evidence: ["Photo proof"],
      },
    ];

    render(
      <MemoryRouter>
        <AdminCasesScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("case-card-case-live-1")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("case-expand-case-live-1"));
    fireEvent.click(screen.getByTestId("case-action-refund-case-live-1"));

    await waitFor(() => {
      expect(mocks.executeSpy).toHaveBeenCalledTimes(1);
      expect(mocks.collectionState.refresh).toHaveBeenCalledTimes(1);
    });

    expect(screen.getByTestId("case-result-banner")).toBeInTheDocument();
  });

  it("uses fallback cards in mock mode without backend side effects", async () => {
    mocks.runtimeMode = "mock";
    mocks.collectionState.rows = [];

    render(
      <MemoryRouter>
        <AdminCasesScreen />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("cases-card-list")).toBeInTheDocument();
      expect(screen.getByTestId("case-card-case-001")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("case-expand-case-001"));
    fireEvent.click(screen.getByTestId("case-action-release-case-001"));

    await waitFor(() => {
      expect(screen.getByTestId("case-result-banner")).toBeInTheDocument();
    });

    expect(mocks.executeSpy).not.toHaveBeenCalled();
    expect(mocks.collectionState.refresh).not.toHaveBeenCalled();
  });
});
