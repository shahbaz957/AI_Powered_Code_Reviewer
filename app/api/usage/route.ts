import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

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
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const userId = session.user.id;

    // ── Usage this month ───────────────────────────────────────────────────
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const usageThisMonth = await prisma.usageRecord.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    // ── Plan limits ────────────────────────────────────────────────────────
    // TODO: when you add plan field to User model, fetch it here and
    // return the correct limit based on plan
    // const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } })
    const plan       = "free"; // replace with user.plan
    const usageLimit = plan === "free" ? 10 : -1; // -1 = unlimited

    // ── All-time stats ─────────────────────────────────────────────────────
    // Fetch all completed reviews to compute stats
    const allReviews = await prisma.review.findMany({
      where: {
        repo: { userId },
        status: "completed",
      },
      select: {
        severity:   true,
        createdAt:  true,
        emailSent:  true,
        _count: { select: { comments: true } },
      },
    });

    const totalReviews = allReviews.length;

    // Total issues across all reviews
    type ReviewItem = typeof allReviews[number];
    const totalIssues = allReviews.reduce(
      (sum: number, r: ReviewItem) => sum + r._count.comments,
      0
    );

    // Clean PR rate = % of reviews with severity "clean"
    const cleanReviews = allReviews.filter((r: ReviewItem) => r.severity === "clean").length;
    const cleanRate =
      totalReviews > 0
        ? Math.round((cleanReviews / totalReviews) * 100)
        : 0;

    // Connected repos count
    const connectedRepos = await prisma.repo.count({
      where: { userId, isActive: true },
    });

    // Security issues specifically (for the "3 security" sub-label on dashboard)
    const securityIssues = await prisma.reviewComment.count({
      where: {
        type: "security",
        review: {
          repo: { userId },
        },
      },
    });

    return NextResponse.json({
      // For the usage bar
      usageThisMonth,
      usageLimit,
      plan,

      // For the stats cards
      totalReviews,
      totalIssues,
      securityIssues,
      cleanRate,        // e.g. 60 (means 60%)
      connectedRepos,
    });
  } catch (error) {
    console.error("[/api/usage GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}