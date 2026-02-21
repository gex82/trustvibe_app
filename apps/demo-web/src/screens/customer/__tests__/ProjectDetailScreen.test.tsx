import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ProjectDetailScreen from "../ProjectDetailScreen";

const mocks = vi.hoisted(() => ({
  dataMode: "mock" as "live" | "mock",
  refresh: vi.fn(async () => undefined),
  project: {
    id: "proj-bathroom",
    customerId: "user-maria",
    title: "Primary Bathroom Renovation",
    description: "Description",
    category: "Bathroom",
    location: "San Juan, PR",
    budget: "$2,500 - $3,500",
    timeline: "3 weeks",
    status: "in_progress",
    createdAt: "2026-02-01",
    photos: ["/images/jobs/bathroom-renovation.png"],
    quotes: [
      {
        id: "quote-juan",
        projectId: "proj-bathroom",
        contractorId: "user-juan",
        amount: 2800,
        breakdown: [],
        timeline: "3 weeks",
        notes: "",
        status: "accepted",
        submittedAt: "2026-02-02",
      },
    ],
    acceptedQuoteId: "quote-juan",
    escrowAmount: 2800,
    trustvibeFee: 196,
    estimateDeposit: undefined,
  } as any,
  previewEstimateDeposit: vi.fn(),
  createEstimateDeposit: vi.fn(),
  captureEstimateDeposit: vi.fn(),
  createBookingRequest: vi.fn(),
}));

vi.mock("../../../context/ProjectsContext", () => ({
  useProjects: () => ({
    projects: [mocks.project],
    loading: false,
    refresh: mocks.refresh,
    getProject: (id: string) => (id === mocks.project.id ? mocks.project : undefined),
    acceptQuote: vi.fn(async () => undefined),
    fundEscrow: vi.fn(async () => undefined),
    requestCompletion: vi.fn(async () => undefined),
    approveRelease: vi.fn(async () => undefined),
    raiseIssue: vi.fn(async () => undefined),
    submitQuote: vi.fn(async () => undefined),
    addProject: vi.fn(async () => "proj-new"),
  }),
}));

vi.mock("../../../context/RuntimeContext", () => ({
  useRuntime: () => ({
    dataMode: mocks.dataMode,
    backendReachable: true,
    autoFallback: false,
    setDataMode: vi.fn(),
    recheckBackend: vi.fn(async () => true),
  }),
}));

vi.mock("../../../context/AppContext", () => ({
  useApp: () => ({
    lang: "en",
    locale: "en-US",
    setLang: vi.fn(),
    t: (key: string, fallback?: string) => {
      const dict: Record<string, string> = {
        "category.bathroom": "Bathroom",
        "detail.projectTitle": "Project",
        "detail.projectNotFound": "Project not found",
        "projects.budget": "Budget",
        "detail.progress": "Project progress",
        "detail.inProgress": "In progress",
        "detail.completionRequested": "Completion requested",
        "detail.description": "Description",
        "detail.photos": "Photos",
        "detail.selectedContractor": "Selected contractor",
        "detail.agreedAmount": "Agreed amount",
        "detail.tvFee": "TrustVibe fee",
        "detail.contractorReceives": "Contractor receives",
        "detail.escrowNote": "Funds held in escrow",
        "detail.messageContractor": "Message contractor",
        "detail.quotes": "Quotes",
        "detail.selectContractor": "Select contractor",
        "detail.developerActions": "Developer actions",
        "detail.quoteAmount": "Quote amount:",
        "detail.timeline": "Timeline:",
        "detail.createEstimateDeposit": "Create estimate deposit",
        "detail.depositConfirmTitle": "Create estimate deposit?",
        "detail.depositConfirmAmountLabel": "Estimated deposit:",
        "detail.depositConfirmCancel": "Cancel",
        "detail.depositConfirmCreate": "Create deposit",
        "detail.depositPreviewRationaleMock":
          "Calculated from demo deposit policy for this project category.",
        "detail.depositCardTitle": "Deposit Details",
        "detail.depositAmountLabel": "Amount:",
        "detail.depositStatusLabel": "Status:",
        "detail.depositStatusCreated": "Created",
        "detail.depositStatusCaptured": "Captured",
        "detail.depositCreated": "Estimate deposit created.",
        "detail.captureEstimateDeposit": "Capture estimate deposit",
        "detail.depositCaptured": "Estimate deposit captured.",
        "detail.createBookingRequest": "Create booking request",
        "detail.bookingSuccess": "Booking request created successfully.",
        "detail.bookingDisabledNeedsDeposit":
          "Create an estimate deposit before creating a booking request.",
        "detail.bookingDisabledNeedsCapturedDeposit":
          "Capture the estimate deposit before creating a booking request.",
        "detail.workflowErrorGeneric": "Something went wrong.",
        "label.jobs": "Jobs",
        "status.in_progress": "in progress",
      };
      return dict[key] ?? fallback ?? key;
    },
  }),
}));

vi.mock("../../../data/users", () => ({
  findUserById: () => ({
    id: "user-juan",
    name: "Juan Reyes",
    businessName: "Juan's Home Services",
    avatarUrl: "/images/contractors/juan-reyes.png",
    rating: 4.8,
    completedJobs: 23,
  }),
}));

vi.mock("../../../services/api", () => ({
  previewEstimateDeposit: (...args: unknown[]) => mocks.previewEstimateDeposit(...args),
  createEstimateDeposit: (...args: unknown[]) => mocks.createEstimateDeposit(...args),
  captureEstimateDeposit: (...args: unknown[]) => mocks.captureEstimateDeposit(...args),
  createBookingRequest: (...args: unknown[]) => mocks.createBookingRequest(...args),
}));

function renderScreen() {
  return render(
    <MemoryRouter initialEntries={["/project/proj-bathroom"]}>
      <Routes>
        <Route path="/project/:id" element={<ProjectDetailScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProjectDetailScreen", () => {
  beforeEach(() => {
    mocks.dataMode = "mock";
    mocks.refresh.mockClear();
    mocks.previewEstimateDeposit.mockReset();
    mocks.createEstimateDeposit.mockReset();
    mocks.captureEstimateDeposit.mockReset();
    mocks.createBookingRequest.mockReset();
  });

  it("supports deposit modal, capture, and booking gate in mock mode", async () => {
    renderScreen();

    fireEvent.click(screen.getByTestId("project-detail-toggle-developer-actions"));

    expect(
      screen.getByTestId("project-detail-booking-disabled-reason")
    ).toHaveTextContent(
      "Create an estimate deposit before creating a booking request."
    );

    fireEvent.click(screen.getByTestId("project-detail-create-estimate-deposit"));

    await waitFor(() => {
      expect(
        screen.getByTestId("project-detail-deposit-confirm-modal")
      ).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("project-detail-deposit-confirm-create"));

    await waitFor(() => {
      expect(screen.getByTestId("project-detail-deposit-card")).toBeInTheDocument();
      expect(screen.getByTestId("project-detail-deposit-status")).toHaveTextContent(
        "Created"
      );
    });

    expect(
      screen.getByTestId("project-detail-booking-disabled-reason")
    ).toHaveTextContent(
      "Capture the estimate deposit before creating a booking request."
    );

    fireEvent.click(screen.getByTestId("project-detail-capture-estimate-deposit"));

    await waitFor(() => {
      expect(screen.getByTestId("project-detail-deposit-status")).toHaveTextContent(
        "Captured"
      );
    });

    const bookingButton = screen.getByTestId("project-detail-create-booking-request");
    expect(bookingButton).not.toBeDisabled();
    fireEvent.click(bookingButton);

    await waitFor(() => {
      expect(screen.getByTestId("project-detail-booking-success")).toBeInTheDocument();
    });

    expect(mocks.previewEstimateDeposit).not.toHaveBeenCalled();
    expect(mocks.createEstimateDeposit).not.toHaveBeenCalled();
    expect(mocks.captureEstimateDeposit).not.toHaveBeenCalled();
    expect(mocks.createBookingRequest).not.toHaveBeenCalled();
  });
});
