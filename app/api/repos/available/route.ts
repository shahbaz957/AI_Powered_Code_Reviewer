import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOctokitForUser } from "@/lib/octokit";
import { prisma } from "@/lib/prisma";

// GET /api/repos/available
// Returns the user's GitHub repos with a "connected" flag on each one.
// Used by the Connect Repo dropdown in the dashboard.

export async function GET(req: NextRequest) {
  try {
    // 1. Verify session
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 2. Get authenticated Octokit for this user
    const octokit = await getOctokitForUser(session.user.id);

    // 3. Fetch all repos from GitHub
    // per_page: 100 = max allowed by GitHub API in one request
    // sort: "updated" = most recently active repos first
    // affiliation: "owner" = only repos the user personally owns
    //   (remove affiliation to also include org repos they're a member of)
    const { data: githubRepos } = await octokit.repos.listForAuthenticatedUser({
      per_page: 100,
      sort: "updated",
      affiliation: "owner",
    });

    // 4. Find which repos the user has already connected in your DB
    // We get all their connected repo GitHub IDs so we can mark them
    const connectedRepos = await prisma.repo.findMany({
      where: {
        userId: session.user.id,
        isActive: true,
      },
      select: {
        githubRepoId: true, // only fetch the ID — no need for full record
      },
    });

    // Build a Set for O(1) lookup — faster than .find() in a loop
    const connectedIds = new Set(connectedRepos.map((r: { githubRepoId: number }) => r.githubRepoId));

    // 5. Shape the response — only send what the frontend needs
    const repos = githubRepos.map((r) => ({
      id: r.id,                          // GitHub repo ID (number)
      name: r.name,                      // "pr-reviewer"
      fullName: r.full_name,             // "islamkhan/pr-reviewer"
      private: r.private,                // true/false
      language: r.language ?? "Unknown", // "TypeScript"
      stars: r.stargazers_count,         // 12
      updatedAt: r.updated_at,           // "2025-03-24T10:30:00Z"
      connected: connectedIds.has(r.id), // ← the key field for the UI
    }));

    return NextResponse.json({ repos });
  } catch (error) {
    console.error("[/api/repos/available GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch repositories" },
      { status: 500 }
    );
  }
}