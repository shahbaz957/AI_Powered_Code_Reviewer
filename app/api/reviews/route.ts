import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET /api/reviews
// Optional query params:
//   ?repoId=xxx  → filter by specific repo
//   ?limit=20    → how many to return (default 20, max 50)
//
// Returns all reviews for all connected repos belonging to the current user.
// This feeds the main reviews table on the dashboard.

export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const repoId = searchParams.get("repoId");
    const limit  = Math.min(parseInt(searchParams.get("limit") ?? "20"), 50);

    const reviews = await prisma.review.findMany({
      where: {
        ...(repoId ? { repoId } : {}),
        repo: {
          userId: session.user.id,
          isActive: true,
        },
      },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        repo: {
          select: {
            name:     true,
            fullName: true,
          },
        },
        _count: {
          select: { comments: true },
        },
      },
    });

    // Shape the response for the frontend
    const shaped = reviews.map((r: typeof reviews[number]) => ({
      id:           r.id,
      prNumber:     r.prNumber,
      prTitle:      r.prTitle,
      prUrl:        r.prUrl,
      prAuthor:     r.prAuthor,
      severity:     r.severity,
      summary:      r.summary,
      status:       r.status,
      emailSent:    r.emailSent,
      createdAt:    r.createdAt,
      issueCount:   r._count.comments,  // ← used for the Issues column
      repo: {
        name:     r.repo.name,
        fullName: r.repo.fullName,
      },
    }));

    return NextResponse.json({ reviews: shaped });
  } catch (error) {
    console.error("[/api/reviews GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}