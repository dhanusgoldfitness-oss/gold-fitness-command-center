export type Agent = {
  id: string;
  name: string;
  role: string;
  summary: string;
  duties: string[];
  needsApproval: string[];
};

export const secretary: Agent = {
  id: "secretary",
  name: "AI Secretary",
  role: "Personal assistant to the owner",
  summary:
    "Takes your instructions, assigns work to the 4 team members, and brings you only what needs a decision.",
  duties: [
    "Turn your instructions into tasks for the right agent",
    "Daily briefing: leads, renewals, posts, reviews",
    "Track every task until it is done",
    "Escalate sensitive actions to you",
  ],
  needsApproval: ["Anything touching money, prices or bulk messages"],
};

export const agents: Agent[] = [
  {
    id: "sales",
    name: "Sales & Leads Agent",
    role: "Enquiries to memberships",
    summary:
      "Handles WhatsApp and Instagram enquiries, follows up leads and books trials.",
    duties: [
      "Reply to new enquiries with approved information",
      "Capture lead name, goal and phone number",
      "Follow up trials and walk-ins",
      "Report weekly conversion",
    ],
    needsApproval: ["Offers and discounts", "Quoting any price not on the approved list"],
  },
  {
    id: "creative",
    name: "Creative & Social Agent",
    role: "Content and posting",
    summary: "Plans the week, writes captions, reel scripts and post ideas.",
    duties: [
      "Weekly content calendar",
      "Captions and hashtags",
      "Reel scripts and on-screen text",
      "Festival and offer creatives briefs",
    ],
    needsApproval: ["Publishing any post", "Member photos or testimonials"],
  },
  {
    id: "operations",
    name: "Member Operations Agent",
    role: "Renewals and retention",
    summary:
      "Keeps members active: expiry reminders, absentee follow-up and renewal tracking.",
    duties: [
      "Membership expiry list and reminders",
      "Win-back messages for members who stopped coming",
      "Daily attendance summary",
      "Staff task reminders",
    ],
    needsApproval: ["Bulk messages", "Payment confirmations", "Membership changes"],
  },
  {
    id: "reputation",
    name: "Reputation & Website Agent",
    role: "Google Business and website",
    summary: "Looks after Google reviews, Business posts and website content.",
    duties: [
      "Draft replies to Google reviews",
      "Google Business post drafts",
      "Website content and timing updates",
      "Monthly local-search checklist",
    ],
    needsApproval: ["Posting replies publicly", "Changing timings, prices or offers on the site"],
  },
];

export const approvalRules = [
  "No agent invents prices or confirms payments.",
  "Bulk messages and financial actions wait for owner approval.",
  "Agents report only what is real; no made-up numbers.",
];
