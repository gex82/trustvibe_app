import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import NewProjectScreen from "../NewProjectScreen";

const mocks = vi.hoisted(() => ({
  addProject: vi.fn(async () => "proj-new"),
}));

vi.mock("../../../context/ProjectsContext", () => ({
  useProjects: () => ({
    addProject: mocks.addProject,
  }),
}));

vi.mock("../../../context/AuthContext", () => ({
  useAuth: () => ({
    currentUser: {
      id: "user-maria",
      role: "customer",
      name: "Maria Rodriguez",
      location: "San Juan, PR",
    },
  }),
}));

vi.mock("../../../context/AppContext", () => ({
  useApp: () => ({
    lang: "en",
    locale: "en-US",
    setLang: vi.fn(),
    t: (key: string, fallback?: string) => {
      const dict: Record<string, string> = {
        "newProject.title": "New Project",
        "newProject.contractorLinked": "Contractor linked",
        "newProject.linkedContractorLocked":
          "Linked contractor is locked for this request.",
        "newProject.invalidContractorWarning":
          "The selected contractor link is invalid. Continue by posting a general project request.",
        "newProject.projectTitle": "Project title",
        "newProject.titlePlaceholder": "Project title placeholder",
        "newProject.description": "Description",
        "newProject.descriptionPlaceholder": "Describe your request",
        "newProject.category": "Category",
        "newProject.budget": "Budget",
        "newProject.budgetPlaceholder": "Budget placeholder",
        "newProject.timeline": "Timeline",
        "newProject.location": "Location",
        "newProject.locationPlaceholder": "Location",
        "newProject.timelineOption1to3Days": "1-3 days",
        "newProject.timelineOption1Week": "1 week",
        "newProject.timelineOption2Weeks": "2 weeks",
        "newProject.timelineOption3to4Weeks": "3-4 weeks",
        "newProject.timelineOption1to2Months": "1-2 months",
        "newProject.timelineOptionFlexible": "Flexible",
        "newProject.submit": "Post Project",
        "newProject.posting": "Posting...",
        "newProject.success": "Project Posted!",
        "newProject.successSub": "Success",
        "newProject.viewProject": "View",
        "newProject.viewAll": "View all",
        "category.bathroom": "Bathroom",
        "category.kitchen": "Kitchen",
        "category.painting": "Painting",
        "category.hvac": "HVAC",
        "category.electrical": "Electrical",
        "category.plumbing": "Plumbing",
        "category.carpentry": "Carpentry",
        "category.tiling": "Tiling",
        "category.roofing": "Roofing",
        "category.other": "Other",
      };
      return dict[key] ?? fallback ?? key;
    },
  }),
}));

vi.mock("../../../data/users", () => ({
  findUserById: (id: string) =>
    id === "user-juan"
      ? {
          id: "user-juan",
          role: "contractor",
          name: "Juan Reyes",
          businessName: "Juan's Home Services",
        }
      : null,
}));

function renderScreen(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/projects/new" element={<NewProjectScreen />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("NewProjectScreen", () => {
  beforeEach(() => {
    mocks.addProject.mockClear();
  });

  it("locks and submits linked contractor from query param", async () => {
    renderScreen("/projects/new?contractor=user-juan");

    expect(screen.getByTestId("new-project-linked-contractor-card")).toBeVisible();
    expect(screen.getByTestId("new-project-linked-contractor-business")).toHaveTextContent(
      "Juan's Home Services"
    );
    expect(screen.getByTestId("new-project-linked-contractor-person")).toHaveTextContent(
      "Juan Reyes"
    );
    expect(screen.queryByTestId("new-project-invalid-contractor")).toBeNull();

    fireEvent.change(screen.getByTestId("new-project-title"), {
      target: { value: "Bathroom refresh" },
    });
    fireEvent.change(screen.getByTestId("new-project-description"), {
      target: { value: "Need help with bathroom refinishing and tile work." },
    });
    fireEvent.click(screen.getByTestId("new-project-submit"));

    await waitFor(() => {
      expect(mocks.addProject).toHaveBeenCalledWith(
        expect.objectContaining({
          contractorId: "user-juan",
          title: "Bathroom refresh",
        })
      );
    });
  });

  it("shows invalid warning and submits without contractor when query id is invalid", async () => {
    renderScreen("/projects/new?contractor=bad-id");

    expect(screen.getByTestId("new-project-invalid-contractor")).toBeVisible();
    expect(screen.queryByTestId("new-project-linked-contractor-card")).toBeNull();

    fireEvent.change(screen.getByTestId("new-project-title"), {
      target: { value: "Kitchen fix" },
    });
    fireEvent.change(screen.getByTestId("new-project-description"), {
      target: { value: "Need kitchen cabinet alignment and hinge replacement." },
    });
    fireEvent.click(screen.getByTestId("new-project-submit"));

    await waitFor(() => {
      expect(mocks.addProject).toHaveBeenCalledWith(
        expect.objectContaining({
          contractorId: undefined,
          title: "Kitchen fix",
        })
      );
    });
  });
});
