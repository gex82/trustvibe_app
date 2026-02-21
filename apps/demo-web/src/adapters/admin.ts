import type { DemoAdminStats } from "../types";

export function mapAdminStats(input: {
  projects: Array<{ escrowState?: string; heldAmountCents?: number }>;
  cases: Array<{ status?: string }>;
  contractors: Array<{ role?: string; disabled?: boolean }>;
}): DemoAdminStats {
  const totalEscrowCents = input.projects.reduce(
    (sum, project) => sum + Number(project.heldAmountCents ?? 0),
    0
  );
  const escrowProjects = input.projects.filter((project) =>
    ["FUNDED_HELD", "COMPLETION_REQUESTED", "ISSUE_RAISED_HOLD"].includes(
      String(project.escrowState)
    )
  ).length;

  return {
    totalProjects: input.projects.length,
    escrowProjects,
    openCases: input.cases.filter((entry) => String(entry.status) !== "CLOSED")
      .length,
    verifiedContractors: input.contractors.filter(
      (entry) => entry.role === "contractor" && entry.disabled !== true
    ).length,
    totalEscrowCents,
  };
}
