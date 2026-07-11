/** Review statuses that indicate work still in progress. */
export const IN_PROGRESS_REVIEW_STATUSES = new Set([
  "pending",
  "reviewing",
  "queued",
]);

export function isReviewInProgress(status: string): boolean {
  return IN_PROGRESS_REVIEW_STATUSES.has(status);
}

export function hasInProgressReviews(
  reviews: ReadonlyArray<{ status: string }>,
): boolean {
  return reviews.some((r) => isReviewInProgress(r.status));
}
