// Simple rule-based routing used by the secretary until an AI model key is connected.
const rules: { agent: string; words: string[] }[] = [
  { agent: "sales", words: ["lead", "enquiry", "inquiry", "trial", "join", "walk-in", "new member", "conversion"] },
  { agent: "creative", words: ["post", "reel", "caption", "instagram", "poster", "video", "content", "story", "hashtag"] },
  { agent: "operations", words: ["renewal", "expiry", "expire", "attendance", "absent", "reminder", "inactive", "dues"] },
  { agent: "reputation", words: ["google", "review", "website", "listing", "rating", "business profile"] },
];

// Anything touching money or mass messaging needs the owner's approval first.
const sensitive = ["price", "pricing", "discount", "offer", "payment", "refund", "fee", "bulk", "broadcast", "all members"];

export function routeTask(text: string) {
  const t = text.toLowerCase();
  const hit = rules.find((r) => r.words.some((w) => t.includes(w)));
  return {
    agent: hit ? hit.agent : "secretary",
    needsApproval: sensitive.some((w) => t.includes(w)),
  };
}
