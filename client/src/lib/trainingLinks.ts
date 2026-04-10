/*
 * Training Links Config — CampaignIQ Dashboard
 * Update the URLs below to match the current Pure Storage Intellum portal links.
 * These are used in generated Enablement Plan PDFs.
 */

export interface TrainingLink {
  title: string;
  url: string;
  description: string;
  audience: string;
}

export const TRAINING_LINKS: Record<string, TrainingLink> = {
  salesPro: {
    title: "Sales Professional Learning Path FY27",
    url: "https://purestorage.intellum.com/learn/path/sales-professional-fy27",
    description:
      "Core sales enablement path covering Pure Storage portfolio, competitive positioning, and solution selling.",
    audience: "Account Executives, Inside Sales, Business Development",
  },
  techPro: {
    title: "Technical Sales Professional Learning Path FY27",
    url: "https://purestorage.intellum.com/learn/path/tech-sales-professional-fy27",
    description:
      "Deep-dive technical path covering FlashArray, FlashBlade, Evergreen subscriptions and architecture.",
    audience: "Pre-Sales Engineers, Solution Architects",
  },
  bootcamp: {
    title: "SE Bootcamp FY27",
    url: "https://purestorage.intellum.com/learn/path/se-bootcamp-fy27",
    description:
      "Intensive hands-on bootcamp for systems engineers covering Pure Storage product stack and design.",
    audience: "Systems Engineers, Technical Specialists",
  },
  implSpec: {
    title: "Implementation Specialist / Support Specialist",
    url: "https://purestorage.intellum.com/learn/path/implementation-specialist",
    description:
      "Covers installation, configuration, troubleshooting, and support of Pure Storage platforms.",
    audience: "Implementation Engineers, Support Engineers",
  },
  aspFoundations: {
    title: "ASP Foundations — FlashArray/FlashBlade Training & Assessment",
    url: "https://purestorage.intellum.com/learn/course/asp-foundations",
    description:
      "Required foundational course for ASP (Authorized Support Partner) programme entry.",
    audience: "Support Engineers, Technical Support",
  },
  aspStoragePro: {
    title: "Storage Professional Certification",
    url: "https://purestorage.intellum.com/learn/course/storage-professional-certification",
    description:
      "FlashArray/FlashBlade Storage Professional Certification exam — required for ASP eligibility.",
    audience: "Systems Engineers, Solution Architects",
  },
  aspSupportSpec: {
    title: "Support Specialist Certification",
    url: "https://purestorage.intellum.com/learn/course/support-specialist-certification",
    description:
      "FlashArray/FlashBlade Support Specialist Certification exam — required for ASP eligibility.",
    audience: "Support Engineers, Field Service Engineers",
  },
};

/** Candidate pool: people who have NOT yet completed a category but exist in the partner's contact list */
export interface TrainingCandidate {
  email: string;
  firstName: string;
  lastName: string;
  hasCompleted: boolean;
}
