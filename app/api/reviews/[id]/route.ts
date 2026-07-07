import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// GET /api/reviews/[id]
//
// Returns a single review with ALL its comments.
// Used by the PR detail page (/dashboard/reviews/[id]).

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;

    const review = await prisma.review.findFirst({
      where: {
        id,
        // Security: always verify the review belongs to this user
        // We check through the repo → user chain
        repo: {
          userId: session.user.id,
        },
      },
      include: {
        // All individual AI comments with file, line, type, message, suggestion
        comments: {
          orderBy: [
            // Security issues first, then by file name
            { type: "asc" },
            { file: "asc" },
            { line: "asc" },
          ],
        },
        repo: {
          select: {
            name:       true,
            fullName:   true,
            ownerEmail: true,
          },
        },
      },
    });

    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({ review });
  } catch (error) {
    console.error("[/api/reviews/[id] GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch review" },
      { status: 500 }
    );
  }
}