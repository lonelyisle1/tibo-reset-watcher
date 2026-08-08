export const CONTEXT_PATTERNS = [
  /\busage\b/i,
  /\brate\s*limits?\b/i,
  /\blimits?\b/i,
  /\bquota\b/i,
  /\ballowance\b/i,
  /\bcredits?\b/i,
  /\bcodex\b/i,
  /\bchatgpt(?:\s+work)?\b/i,
  /额度|限额|用量/i
];

export const NEGATION_PATTERNS = [
  /\bno\b.{0,50}\breset(?:ting)?\b/i,
  /\bnot\b.{0,35}\breset(?:ting)?\b/i,
  /\bdoes\s+not\b.{0,25}\breset\b/i,
  /\bdoesn(?:'|’)t\b.{0,25}\breset\b/i,
  /\bwithout\b.{0,25}\breset(?:ting)?\b/i,
  /(?:不会|不打算|没有计划|并非).{0,25}(?:重置|刷新)/i
];

export const COMPLETED_RESET_PATTERNS = [
  /\b(?:have|has|had|we(?:'|’)ve|i(?:'|’)ve)\s+(?:now\s+|just\s+)?reset\b/i,
  /\bhas\s+been\s+reset\b/i,
  /\breset\s+(?:is\s+)?(?:complete|completed|done)\b/i,
  /\breset\s+button\s+pressed\b/i,
  /\blimits?\s+(?:are|have been)\s+(?:restored|reset|refreshed|renewed)\b/i,
  /\bwe\s+(?:just\s+|now\s+)?reset\s+(?:everyone(?:'|’)s|all)\b/i,
  /(?:已经|已完成|刚刚|现已).{0,25}(?:重置|刷新|恢复)/i
];

export const POSSIBLE_RESET_PATTERNS = [
  /\b(?:may|might|could)\s+(?:need to\s+)?reset\b/i,
  /\bplanning\s+to\s+reset\b/i,
  /\bconsider(?:ing)?\s+(?:a\s+)?reset\b/i,
  /\bif\b.{0,80}\b(?:will|we(?:'|’)ll|may|might)\s+reset\b/i,
  /(?:可能|也许|计划|考虑).{0,25}(?:重置|刷新)/i
];

export const UPCOMING_RESET_PATTERNS = [
  /\b(?:will|we(?:'|’)ll|i(?:'|’)ll|going to|about to)\s+(?:hard\s+)?reset\b/i,
  /\breset(?:ting)?\b.{0,45}\b(?:tomorrow|tonight|later today|this evening|later|soon|incoming|in \d+\s*(?:hour|minute)s?)\b/i,
  /\b(?:tomorrow|tonight|later today|this evening|later|soon)\b.{0,45}\breset(?:ting)?\b/i,
  /\bbefore\s+(?:we|i)\s+reset\b/i,
  /\bhard\s+reset\b/i,
  /\breset(?:ting)?\s+(?:everyone(?:'|’)s\s+)?(?:usage\s+)?limits?\b/i,
  /\breset\s+incoming\b/i,
  /(?:即将|将在|今晚|明天|稍后).{0,25}(?:重置|刷新)/i
];

export const LIMIT_CHANGE_PATTERNS = [
  /\busage\s+limits?\b/i,
  /\brate\s+limits?\b/i,
  /\b(?:higher|increased?|double[ds]?|2x|more)\s+limits?\b/i,
  /\badditional\s+(?:usage|credits?|capacity)\b/i,
  /\bquota\b/i,
  /\bbank(?:ed|ing)?\s+(?:your\s+|the\s+)?reset\b/i,
  /\bsave\s+(?:your\s+|the\s+)?reset\b/i,
  /\bchatgpt\s+work\b/i,
  /\bcodex\s+limits?\b/i,
  /额度|限额|用量|翻倍|增加额度|规则调整/i
];

export const BANKED_RESET_PATTERNS = [
  /\bbank(?:ed|ing)?\s+(?:your\s+|the\s+)?reset\b/i,
  /\bsave\s+(?:your\s+|the\s+)?reset\b/i,
  /\bredeem\s+(?:it|the reset)\s+later\b/i,
  /(?:储存|保存|兑换).{0,20}重置/i
];

// Tibo sometimes hints at a quota reset without naming Codex or usage limits.
// These deliberately remain a lower-confidence signal rather than an urgent reset.
export const AMBIGUOUS_RESET_SIGNAL_PATTERNS = [
  /\b(?:in need of|deserve(?:s)?|could use)\s+(?:a\s+)?reset\b/i,
  /\b(?:i(?:'|’)m\s+)?feel(?:ing)?\s+like\s+(?:a\s+)?(?:limit\s+)?reset\b/i,
  /\breset\s+button\b/i,
  /\breset\b\s*(?:👀|😉|🤫)\s*$/u,
  /(?:该|需要|来个|值得).{0,18}(?:额度)?重置(?:了|一下|吧)?/i
];

// Clear non-quota uses of "reset" stay filtered unless explicit quota context is present.
export const NON_QUOTA_RESET_PATTERNS = [
  /\breset(?:ting)?\s+(?:(?:my|your|the|this|our)\s+)?(?:laptop|computer|pc|phone|router|modem|server|database|password|passcode|device|browser|demo|environment|branch|repository)\b/i,
  /\b(?:factory|password|router|device|server|database)\s+reset\b/i,
  /(?:重置|恢复).{0,12}(?:电脑|手机|路由器|服务器|数据库|密码|浏览器)/i
];
