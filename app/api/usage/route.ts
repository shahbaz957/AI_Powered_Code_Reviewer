import { NextRequest } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { privateJson } from "@/lib/api-response";

// GET /api/usage
//
// Returns usage stats for the current user.
// Used by:
//   - Dashboard: usage bar (4/10 reviews used)
//   - Stats cards: total issues, avg review time, clean PR rate
//   - Pricing page: current plan display

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return privateJson({ error: "Not authenticated" }, 401);
    }

    const userId = session.user.id;

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const completedWhere = {
      repo: { userId },
      status: "completed" as const,
    };

    // Parallel aggregations — avoids loading every review row into memory
    const [
      usageThisMonth,
      connectedRepos,
      totalReviews,
      cleanReviews,
      totalIssues,
      securityIssues,
    ] = await Promise.all([
      prisma.usageRecord.count({
        where: { userId, createdAt: { gte: startOfMonth } },
      }),
      prisma.repo.count({ where: { userId, isActive: true } }),
      prisma.review.count({ where: completedWhere }),
      prisma.review.count({
        where: { ...completedWhere, severity: "clean" },
      }),
      prisma.reviewComment.count({
        where: { review: completedWhere },
      }),
      prisma.reviewComment.count({
        where: { type: "security", review: { repo: { userId } } },
      }),
    ]);

    const plan = "free";
    const usageLimit = plan === "free" ? 10 : -1;
    const cleanRate =
      totalReviews > 0 ? Math.round((cleanReviews / totalReviews) * 100) : 0;

    return privateJson({
      usageThisMonth,
      usageLimit,
      plan,
      totalReviews,
      totalIssues,
      securityIssues,
      cleanRate,
      connectedRepos,
    });
  } catch (error) {
    console.error("[/api/usage GET]", error);
    return privateJson({ error: "Failed to fetch usage data" }, 500);
  }
}