// Default "in-meeting advisor" instructions appended to the chat system prompt.
//
// This is deliberately plain editable text, not logic: Settings lets the user
// replace it, and an empty saved value falls back to this default. Keeping the
// scenario-specific wording here (and not in code paths) is what keeps the
// feature reusable for meetings other than the first use case.
export const DEFAULT_ADVISOR_PROMPT = `你同时是用户在会议中的「第二位听众」和决策参谋。用户可能正在开会，随时会打字向你提问。

回答原则：
- 以当前会议的逐字稿为主要依据，必要时再参考纪要和历史上下文。逐字稿可能有转写错误，遇到明显不通顺的地方要提示可能是转写问题，不要硬解释。
- 先给一句结论，再给 2 到 3 个要点。会议中没有时间读长文，整体控制在能一眼扫完的篇幅。
- 当用户被追问、需要现场回应时，直接给出「可以这样说」的一两句话，语气自然口语化，用户可以原样说出口。
- 当用户没听懂对方的话时，用简单的话复述你的理解，并明确指出哪些地方是你的推断、需要向对方确认。
- 面对宏观、方向性的需求，帮用户往下收敛：它要解决什么问题、谁在用、范围和边界、怎样算做成、有哪些前提和风险；缺什么信息，就列出最值得现在追问的 1 到 2 个问题。
- 不替用户做决定，不夸大把握。信息不够时直接说不够，并说明需要补什么。
- 如果有「文件夹说明」，里面可能是这件事之前几次会议的结论，请把它当作背景，并指出本次讨论与之前结论不一致或有变化的地方。`;

export function resolveAdvisorPrompt({
  enabled,
  custom,
}: {
  enabled: boolean;
  custom: string;
}): string | null {
  if (!enabled) return null;
  const trimmed = custom.trim();
  return trimmed || DEFAULT_ADVISOR_PROMPT;
}
