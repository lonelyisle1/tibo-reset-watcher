import {
  BANKED_RESET_PATTERNS,
  COMPLETED_RESET_PATTERNS,
  CONTEXT_PATTERNS,
  LIMIT_CHANGE_PATTERNS,
  NEGATION_PATTERNS,
  POSSIBLE_RESET_PATTERNS,
  UPCOMING_RESET_PATTERNS
} from "./rules.js";

function matchesAny(text, patterns) {
  return patterns.some((pattern) => pattern.test(text));
}

function matchedSupplementalTerms(text, terms = []) {
  const normalized = text.toLocaleLowerCase();
  return [...new Set(terms
    .map((term) => String(term).trim().toLocaleLowerCase())
    .filter((term) => term && normalized.includes(term)))];
}

function result(relevant, eventType, level, judgmentZh, actionZh, matches = []) {
  return { relevant, eventType, level, judgmentZh, actionZh, matches };
}

export function classifyPost(rawText, settings = {}) {
  const text = String(rawText || "").replace(/\s+/g, " ").trim();
  if (!text) return result(false, "unrelated", "none", "没有可判断的帖子文本。", "无需操作。");

  const hasContext = matchesAny(text, CONTEXT_PATTERNS);
  const hasNegation = matchesAny(text, NEGATION_PATTERNS);
  const hasCompleted = matchesAny(text, COMPLETED_RESET_PATTERNS);
  const hasPossible = matchesAny(text, POSSIBLE_RESET_PATTERNS);
  const hasUpcoming = matchesAny(text, UPCOMING_RESET_PATTERNS);
  const hasLimitChange = matchesAny(text, LIMIT_CHANGE_PATTERNS);
  const hasBankedReset = matchesAny(text, BANKED_RESET_PATTERNS);
  const supplemental = matchedSupplementalTerms(text, settings.supplementalTerms);

  if (hasNegation) {
    return result(false, "negated", "none", "帖子明确否定了额度重置。", "无需操作。", supplemental);
  }

  if (hasBankedReset) {
    return result(
      true,
      "limit_change",
      "info",
      "这是可储存、稍后兑换的额度重置规则消息。",
      "查看原帖确认保存或兑换方式，不需要为了这条消息提前消耗额度。",
      supplemental
    );
  }

  if (hasCompleted && hasContext) {
    return result(
      true,
      "completed_reset",
      "info",
      "Tibo 表示额度可能已经重置或恢复。",
      "打开 ChatGPT 或 Codex 检查新额度，不要再消耗旧额度。",
      supplemental
    );
  }

  if (hasPossible && hasContext && !hasNegation) {
    return result(
      true,
      "possible_reset",
      "warning",
      "Tibo 提到了可能发生的额度重置，但尚未完全确定。",
      "提前检查剩余额度并关注原帖后续更新。",
      supplemental
    );
  }

  if (hasUpcoming && hasContext && !hasNegation) {
    return result(
      true,
      "upcoming_reset",
      "urgent",
      "Tibo 可能宣布了即将进行的额度重置。",
      "尽快使用当前剩余额度，并打开原帖确认时间。",
      supplemental
    );
  }

  if ((hasLimitChange || supplemental.length > 0) && settings.notifyRuleChanges !== false) {
    return result(
      true,
      "limit_change",
      "info",
      "这是额度增加、额度规则或使用限制相关消息。",
      "查看原帖，确认自己的套餐和额度是否受影响。",
      supplemental
    );
  }

  return result(false, "unrelated", "none", "未发现明确的额度或重置含义。", "无需操作。", supplemental);
}
