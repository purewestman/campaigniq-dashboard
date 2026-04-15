import { Partner } from "./data";
import { activityData } from "./activityData";
import { 
  Briefcase, Search, Award, Wrench, Zap, GraduationCap,
  Shield, Users, TrendingUp, Target
} from "lucide-react";

export interface TimelineItem {
  id: string;
  monthRange: string;
  quarter: string;
  category: "enablement" | "demand-gen" | "certification";
  label: string;
  description: string;
  status: "completed" | "planned" | "gap";
  icon: any;
  color: string;
}

export function getDefaultTimeline(partner: Partner): TimelineItem[] {
  const reqs = partner.requirements;
  const activities = activityData[partner.name] || [];

  const hasActivity = (keywords: string[]) => {
    return keywords.some(kw => 
      activities.some(a => a.activity.toLowerCase().includes(kw.toLowerCase()))
    );
  };

  return [
    {
      id: "sales-pro",
      monthRange: "Month 1-2",
      quarter: "Q1",
      category: "enablement",
      label: "Sales Professional Foundation",
      description: "Complete foundational sales paths to align on Pure Storage value proposition.",
      status: reqs.salesPro.obtained >= reqs.salesPro.required ? "completed" : "gap",
      icon: Briefcase,
      color: "#FF7023" // Fixed colors for PDF rendering, replacing CSS vars
    },
    {
      id: "product-tour",
      monthRange: "Month 1-3",
      quarter: "Q1",
      category: "demand-gen",
      label: "Platform Awareness (Product Tours)",
      description: "Engage with 3D Product Tours to master platform aesthetics and key hardware features.",
      status: hasActivity(["3D Product Tour"]) ? "completed" : "planned",
      icon: Search,
      color: "#5A6359"
    },
    {
      id: "ppp-cert",
      monthRange: "Month 2-3",
      quarter: "Q1",
      category: "certification",
      label: "Pure Platform Positioning (PPP)",
      description: "Obtain the PPP certificate to validate solution messaging expertise.",
      status: hasActivity(["Platform Positioning"]) ? "completed" : "gap",
      icon: Award,
      color: "#FF7023"
    },
    {
      id: "tech-pro",
      monthRange: "Month 4-5",
      quarter: "Q2",
      category: "enablement",
      label: "Technical Sales Professional",
      description: "Deep dive into technical architecture and sizing tools.",
      status: reqs.techPro.obtained >= reqs.techPro.required ? "completed" : "gap",
      icon: Wrench,
      color: "#5A6359"
    },
    {
      id: "solution-messaging",
      monthRange: "Month 4-6",
      quarter: "Q2",
      category: "demand-gen",
      label: "Solution Messaging Workshops",
      description: "Participate in AI, Cloud, or Cyber Resilience workshops to sharpen demand gen skills.",
      status: hasActivity(["Workshop", "Technical Sellers", "Artificial Intelligence", "Cyber Resilience"]) ? "completed" : "planned",
      icon: Zap,
      color: "#FF7023"
    },
    {
      id: "bootcamp",
      monthRange: "Month 5-6",
      quarter: "Q2",
      category: "enablement",
      label: "SE Bootcamp",
      description: "Hands-on implementation training for pre-sales engineers.",
      status: reqs.bootcamp.obtained >= reqs.bootcamp.required ? "completed" : "gap",
      icon: GraduationCap,
      color: "#7fa38a"
    },
    {
      id: "asp-foundations",
      monthRange: "Month 7-8",
      quarter: "Q3",
      category: "certification",
      label: "ASP Foundations Specialization",
      description: "Qualify for Authorized Support Partner status with specialized storage training.",
      status: reqs.aspFoundations.totalObtained >= reqs.aspFoundations.required ? "completed" : "planned",
      icon: Shield,
      color: "#FF7023"
    },
    {
      id: "customer-references",
      monthRange: "Month 7-9",
      quarter: "Q3",
      category: "demand-gen",
      label: "Customer Success / Reference Stories",
      description: "Develop joint customer reference materials and demand generation case studies.",
      status: hasActivity(["Reference", "Slide"]) ? "completed" : "planned",
      icon: Users,
      color: "#5A6359"
    },
    {
      id: "storage-pro",
      monthRange: "Month 8-9",
      quarter: "Q3",
      category: "certification",
      label: "FlashBlade Storage Professional",
      description: "Advanced certification focusing on the FlashBlade portfolio.",
      status: reqs.aspStoragePro.totalObtained >= reqs.aspStoragePro.required ? "completed" : "planned",
      icon: Award,
      color: "#FF7023"
    },
    {
      id: "support-spec",
      monthRange: "Month 10-11",
      quarter: "Q4",
      category: "certification",
      label: "ASP Support Specialist",
      description: "Validate expert-level support capabilities for the full portfolo.",
      status: reqs.aspSupportSpec.totalObtained >= reqs.aspSupportSpec.required ? "completed" : "planned",
      icon: Shield,
      color: "#FF7023"
    },
    {
      id: "market-expansion",
      monthRange: "Month 10-12",
      quarter: "Q4",
      category: "demand-gen",
      label: "Strategic Market Expansion",
      description: "Full alignment on solution practices and joint market development (MDF) plans.",
      status: hasActivity(["Strategy", "MDF", "Marketing"]) ? "completed" : "planned",
      icon: TrendingUp,
      color: "#5A6359"
    }
  ];
}

export function getResolvedTimeline(partner: Partner): TimelineItem[] {
  let items = getDefaultTimeline(partner);
  
  try {
    const customTimelinesRaw = localStorage.getItem('pei-partner-timelines-v1');
    if (customTimelinesRaw) {
      const parsed = JSON.parse(customTimelinesRaw);
      if (parsed[partner.id]) {
        items = parsed[partner.id];
      }
    }
  } catch (e) {
    console.error("Failed to parse local storage timeline items", e);
  }
  
  return items;
}
