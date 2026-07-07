import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { reviewPR } from "@/inngest/functions/review-pr";

// GET|POST|PUT /api/inngest
//
// This is the Inngest endpoint — it serves as both:
// 1. The registration endpoint (Inngest cloud syncs your functions from here)
// 2. The execution endpoint (Inngest calls this to run your functions)
//
// You register this URL in your Inngest dashboard:
//   https://app.inngest.com → Your App → Add endpoint → https://yourapp.com/api/inngest
//
// In dev: run "npx inngest-cli dev" to get a local Inngest tunnel

export const { GET, POST, PUT } = serve({
  client: inngest,
  // Register ALL your Inngest functions here
  // Every new function you create must be added to this array
  functions: [reviewPR],
});