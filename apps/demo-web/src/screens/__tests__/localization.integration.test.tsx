import { useEffect, type ReactNode } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AppProvider, useApp } from "../../context/AppContext";
import CustomerHomeScreen from "../customer/CustomerHomeScreen";
import ContractorHomeScreen from "../contractor/ContractorHomeScreen";
import AdminDashboardScreen from "../admin/AdminDashboardScreen";

const mocks = vi.hoisted(() => ({
  logout: vi.fn(async () => undefined),
  currentUser: {
    id: "user-maria",
    email: "maria.rodriguez@trustvibe.test",
    password: "",
    role: "customer",
    name: "Maria Rodriguez",
    avatarUrl: "/images/contractors/maria-rodriguez.png",
    location: "San Juan, PR",
    memberSince: "2024-03",
    verified: true,
  } as any,
  projects: [
    {
      id: "proj-1",
      customerId: "user-maria",
      title: "Primary Bathroom Renovation",
      description: "Desc",
      category: "Bathroom",
      location: "San Juan, PR",
      budget: "$2,500 - $3,500",
      timeline: "3-4 weeks",
      status: "in_progress",
      createdAt: "2026-02-01",
      photos: ["/images/jobs/bathroom-renovation.png"],
      quotes: [
        {
          id: "quote-1",
          projectId: "proj-1",
          contractorId: "user-juan",
          amount: 2800,
          breakdown: [],
          timeline: "3 weeks",
          notes: "",
          status: "accepted",
          submittedAt: "2026-02-01",
        },
      ],
      acceptedQuoteId: "quote-1",
      escrowAmount: 2800,
      trustvibeFee: 196,
    },
  ] as any[],
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    currentUser: mocks.currentUser,
    logout: mocks.logout,
    login: vi.fn(),
    hydrating: false,
  }),
}));

vi.mock("../../context/ProjectsContext", () => ({
  useProjects: () => ({
    projects: mocks.projects,
    loading: false,
    refresh: vi.fn(async () => undefined),
    getProject: (id: string) => mocks.projects.find((project) => project.id === id),
    acceptQuote: vi.fn(async () => undefined),
    fundEscrow: vi.fn(async () => undefined),
    requestCompletion: vi.fn(async () => undefined),
    approveRelease: vi.fn(async () => undefined),
    raiseIssue: vi.fn(async () => undefined),
    submitQuote: vi.fn(async () => undefined),
    addProject: vi.fn(async () => "proj-new"),
  }),
}));

function ForceLanguage({ lang }: { lang: "en" | "es" }) {
  const { setLang } = useApp();

  useEffect(() => {
    setLang(lang);
  }, [lang, setLang]);

  return null;
}

function renderWithProviders(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <AppProvider>{ui}</AppProvider>
    </MemoryRouter>
  );
}

describe("screen localization integration", () => {
  beforeEach(() => {
    mocks.logout.mockClear();
    mocks.currentUser = {
      id: "user-maria",
      email: "maria.rodriguez@trustvibe.test",
      password: "",
      role: "customer",
      name: "Maria Rodriguez",
      avatarUrl: "/images/contractors/maria-rodriguez.png",
      location: "San Juan, PR",
      memberSince: "2024-03",
      verified: true,
    };
  });

  it("re-renders customer home in Spanish after language toggle", async () => {
    renderWithProviders(<CustomerHomeScreen />);

    expect(screen.getByText("Find Contractors")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("home-language-es"));

    await waitFor(() => {
      expect(screen.getByText("Buscar Contratistas")).toBeInTheDocument();
    });
    expect(screen.queryByText("Find Contractors")).not.toBeInTheDocument();
  });

  it("renders contractor home in Spanish mode", async () => {
    mocks.currentUser = {
      id: "user-juan",
      email: "juan.services@trustvibe.test",
      password: "",
      role: "contractor",
      name: "Juan Reyes",
      businessName: "Juan's Home Services",
      specialty: ["Plumbing"],
      rating: 4.8,
      reviewCount: 31,
      completedJobs: 23,
      bio: "Bio",
      portfolioImages: [],
      insuranceVerified: true,
      responseTime: "< 2 hours",
      badges: ["Licensed"],
      avatarUrl: "/images/contractors/juan-reyes.png",
      location: "San Juan, PR",
      memberSince: "2023-11",
      verified: true,
      reliabilityScore: 96,
    } as any;

    renderWithProviders(
      <>
        <ForceLanguage lang="es" />
        <ContractorHomeScreen />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText("Resumen de Ganancias")).toBeInTheDocument();
    });
    expect(screen.queryByText("Earnings Overview")).not.toBeInTheDocument();
  });

  it("renders admin dashboard in Spanish mode", async () => {
    mocks.currentUser = {
      id: "user-admin",
      email: "admin@trustvibe.test",
      password: "",
      role: "admin",
      name: "Admin",
      avatarUrl: "/images/contractors/maria-rodriguez.png",
      location: "San Juan, PR",
      memberSince: "2023-01",
      verified: true,
    } as any;

    renderWithProviders(
      <>
        <ForceLanguage lang="es" />
        <AdminDashboardScreen />
      </>
    );

    await waitFor(() => {
      expect(screen.getByText("Panel de Administración")).toBeInTheDocument();
    });
    expect(screen.getByText("Usuarios")).toBeInTheDocument();
    expect(screen.queryByText("Admin Panel")).not.toBeInTheDocument();
  });
});
