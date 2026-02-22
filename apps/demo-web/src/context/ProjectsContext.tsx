import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Project, Quote } from "../types";
import { getInitialProjects } from "../data/projects";
import {
  acceptAgreement,
  approveRelease as approveReleaseApi,
  createProject as createProjectApi,
  fundHold,
  getProject as getProjectApi,
  listProjects as listProjectsApi,
  raiseIssueHold,
  requestCompletion as requestCompletionApi,
  selectContractor,
  submitQuote as submitQuoteApi,
} from "../services/api";
import {
  mapProjectDetailResponse,
  mapProjectRecordToDemoProject,
} from "../adapters/projects";
import { useRuntime } from "./RuntimeContext";
import { enableDemoDataFallback } from "../config/runtime";
import { useApp } from "./AppContext";

interface ProjectsContextType {
  projects: Project[];
  loading: boolean;
  refresh: () => Promise<void>;
  getProject: (id: string) => Project | undefined;
  acceptQuote: (projectId: string, quoteId: string) => Promise<void>;
  fundEscrow: (projectId: string) => Promise<void>;
  requestCompletion: (projectId: string) => Promise<void>;
  approveRelease: (projectId: string) => Promise<void>;
  raiseIssue: (projectId: string) => Promise<void>;
  submitQuote: (
    projectId: string,
    quote: Omit<Quote, "id" | "submittedAt">
  ) => Promise<void>;
  addProject: (
    project: Omit<Project, "id" | "createdAt" | "quotes" | "status">
  ) => Promise<string>;
}

const ProjectsContext = createContext<ProjectsContextType | null>(null);

function cloneMockProjects(lang: "en" | "es"): Project[] {
  return getInitialProjects(lang).map((item) => ({
    ...item,
    quotes: item.quotes.map((quote) => ({ ...quote, breakdown: [...quote.breakdown] })),
    photos: [...item.photos],
    estimateDeposit: item.estimateDeposit ? { ...item.estimateDeposit } : undefined,
    completionPhotos: item.completionPhotos ? [...item.completionPhotos] : undefined,
  }));
}

function parseBudgetLabel(budget: string): { min?: number; max?: number } {
  const numericParts = budget
    .replace(/,/g, "")
    .match(/\d+/g)
    ?.map((value) => Number(value))
    .filter((value) => Number.isFinite(value));

  if (!numericParts || !numericParts.length) {
    return {};
  }

  const min = Math.min(...numericParts);
  const max = Math.max(...numericParts);
  return {
    min: min * 100,
    max: max * 100,
  };
}

export function buildCreateProjectPayload(
  projectData: Omit<Project, "id" | "createdAt" | "quotes" | "status">
) {
  const budget = parseBudgetLabel(projectData.budget);
  return {
    category: String(projectData.category).toLowerCase() as any,
    title: projectData.title,
    description: projectData.description,
    photos: projectData.photos,
    municipality: projectData.location,
    desiredTimeline: projectData.timeline,
    budgetMinCents: budget.min,
    budgetMaxCents: budget.max,
    contractorId: projectData.contractorId,
  };
}

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const { dataMode, setDataMode } = useRuntime();
  const { lang } = useApp();
  const [projects, setProjects] = useState<Project[]>(() => cloneMockProjects(lang));
  const [loading, setLoading] = useState(true);

  const updateProject = useCallback((projectId: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((item) => (item.id === projectId ? { ...item, ...updates } : item))
    );
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);

    if (dataMode === "mock") {
      setProjects(cloneMockProjects(lang));
      setLoading(false);
      return;
    }

    try {
      const listed = await listProjectsApi({ limit: 30 });
      const detailedProjects = await Promise.all(
        listed.projects.map(async (projectRecord) => {
          try {
            const detail = await getProjectApi({ projectId: projectRecord.id });
            return mapProjectDetailResponse(detail, lang);
          } catch {
            return mapProjectRecordToDemoProject(projectRecord, [], lang);
          }
        })
      );
      setProjects(detailedProjects);
    } catch {
      if (enableDemoDataFallback) {
        setDataMode("mock");
        setProjects(cloneMockProjects(lang));
      }
    } finally {
      setLoading(false);
    }
  }, [dataMode, lang, setDataMode]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const getProject = useCallback(
    (id: string) => projects.find((item) => item.id === id),
    [projects]
  );

  const acceptQuote = useCallback(
    async (projectId: string, quoteId: string) => {
      if (dataMode === "live") {
        try {
          const result = await selectContractor({ projectId, quoteId });
          await acceptAgreement({
            agreementId: result.agreementId,
            demoAutoAdvance: true,
          });
          await refresh();
          return;
        } catch {
          if (!enableDemoDataFallback) {
            return;
          }
        }
      }

      const project = getProject(projectId);
      if (!project) return;
      const quote = project.quotes.find((item) => item.id === quoteId);
      if (!quote) return;
      const fee = Math.min(Math.round(quote.amount * 0.07), 300);
      updateProject(projectId, {
        acceptedQuoteId: quoteId,
        escrowAmount: quote.amount,
        trustvibeFee: fee,
        status: "funded",
        quotes: project.quotes.map((item) => ({
          ...item,
          status: item.id === quoteId ? "accepted" : "rejected",
        })),
      });
    },
    [dataMode, getProject, refresh, updateProject]
  );

  const fundEscrow = useCallback(
    async (projectId: string) => {
      if (dataMode === "live") {
        try {
          await fundHold({ projectId });
          await refresh();
          return;
        } catch {
          if (!enableDemoDataFallback) {
            return;
          }
        }
      }
      updateProject(projectId, { status: "in_progress" });
    },
    [dataMode, refresh, updateProject]
  );

  const requestCompletion = useCallback(
    async (projectId: string) => {
      if (dataMode === "live") {
        try {
          await requestCompletionApi({ projectId });
          await refresh();
          return;
        } catch {
          if (!enableDemoDataFallback) {
            return;
          }
        }
      }
      updateProject(projectId, { status: "complete_requested" });
    },
    [dataMode, refresh, updateProject]
  );

  const approveRelease = useCallback(
    async (projectId: string) => {
      if (dataMode === "live") {
        try {
          await approveReleaseApi({ projectId });
          await refresh();
          return;
        } catch {
          if (!enableDemoDataFallback) {
            return;
          }
        }
      }
      updateProject(projectId, { status: "completed" });
    },
    [dataMode, refresh, updateProject]
  );

  const raiseIssue = useCallback(
    async (projectId: string) => {
      if (dataMode === "live") {
        try {
          await raiseIssueHold({
            projectId,
            reason: "Issue raised from demo-web flow",
          });
          await refresh();
          return;
        } catch {
          if (!enableDemoDataFallback) {
            return;
          }
        }
      }
      updateProject(projectId, { status: "disputed" });
    },
    [dataMode, refresh, updateProject]
  );

  const submitQuote = useCallback(
    async (projectId: string, quoteData: Omit<Quote, "id" | "submittedAt">) => {
      if (dataMode === "live") {
        try {
          await submitQuoteApi({
            projectId,
            priceCents: Math.round(quoteData.amount * 100),
            timelineDays: Number.parseInt(quoteData.timeline, 10) || 7,
            scopeNotes: quoteData.notes,
            lineItems: quoteData.breakdown.map((item) => ({
              description: item.label,
              amountCents: Math.round(item.amount * 100),
            })),
          });
          await refresh();
          return;
        } catch {
          if (!enableDemoDataFallback) {
            return;
          }
        }
      }

      const newQuote: Quote = {
        ...quoteData,
        id: `quote-new-${Date.now()}`,
        submittedAt: new Date().toISOString(),
      };
      setProjects((prev) =>
        prev.map((item) =>
          item.id === projectId
            ? { ...item, quotes: [...item.quotes, newQuote] }
            : item
        )
      );
    },
    [dataMode, refresh]
  );

  const addProject = useCallback(
    async (
      projectData: Omit<Project, "id" | "createdAt" | "quotes" | "status">
    ): Promise<string> => {
      if (dataMode === "live") {
        try {
          const created = await createProjectApi(buildCreateProjectPayload(projectData));
          await refresh();
          return created.project.id;
        } catch {
          if (!enableDemoDataFallback) {
            throw new Error("Unable to create project");
          }
        }
      }

      const newId = `proj-new-${Date.now()}`;
      const newProject: Project = {
        ...projectData,
        id: newId,
        status: "open",
        quotes: [],
        createdAt: new Date().toISOString().slice(0, 10),
      };
      setProjects((prev) => [newProject, ...prev]);
      return newId;
    },
    [dataMode, refresh]
  );

  const value = useMemo<ProjectsContextType>(
    () => ({
      projects,
      loading,
      refresh,
      getProject,
      acceptQuote,
      fundEscrow,
      requestCompletion,
      approveRelease,
      raiseIssue,
      submitQuote,
      addProject,
    }),
    [
      projects,
      loading,
      refresh,
      getProject,
      acceptQuote,
      fundEscrow,
      requestCompletion,
      approveRelease,
      raiseIssue,
      submitQuote,
      addProject,
    ]
  );

  return (
    <ProjectsContext.Provider value={value}>{children}</ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be inside ProjectsProvider");
  return ctx;
}
