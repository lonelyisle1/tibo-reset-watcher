import { classifyPost } from "./classifier.js";

const RESET_EVENT_TYPES = new Set(["upcoming_reset", "possible_reset", "completed_reset"]);

export function mergeMatchedPostTypes(current = {}, posts = [], settings = {}) {
  const next = { ...current };
  for (const post of posts) {
    if (!post?.id) continue;
    const classification = classifyPost(post.text, settings);
    if (classification.relevant) next[String(post.id)] = classification.eventType;
  }
  return next;
}

export function summarizeMatchedPostTypes(matchedPostTypes = {}) {
  const values = Object.values(matchedPostTypes);
  const categoryCounts = values.reduce((counts, eventType) => {
    counts[eventType] = (counts[eventType] || 0) + 1;
    return counts;
  }, {});
  return {
    relevantPostsFound: values.length,
    resetPostsFound: values.filter((eventType) => RESET_EVENT_TYPES.has(eventType)).length,
    ruleChangePostsFound: categoryCounts.limit_change || 0,
    categoryCounts
  };
}
