import { useState, useEffect } from "react";
import CertificationsPage from "./CertificationsPage";
import PartnerActivityPage from "./PartnerActivityPage";
import { Award, Activity } from "lucide-react";

interface TrainingHubProps {
  initialTab?: "certs" | "activity";
  activityPartnerFilter?: string | null;
  activityCourseFilter?: string | null;
  activitySearchFilter?: string | null;
  forceActivityTab?: number;
  onClearFilters: () => void;
  onNavigateToActivity: (partner: string, course?: string, search?: string) => void;
}

export default function TrainingHub({ 
  initialTab = "certs",
  activityPartnerFilter,
  activityCourseFilter,
  activitySearchFilter,
  forceActivityTab = 0,
  onClearFilters,
  onNavigateToActivity
}: TrainingHubProps) {
  const [activeTab, setActiveTab] = useState<"certs" | "activity">(initialTab);

  // If filters are set or forced, open the activity tab
  useEffect(() => {
    if (activityPartnerFilter || activityCourseFilter || activitySearchFilter || forceActivityTab > 0) {
      setActiveTab("activity");
    }
  }, [activityPartnerFilter, activityCourseFilter, activitySearchFilter, forceActivityTab]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <Award className="w-5 h-5" style={{ color: "var(--color-basil-green)" }} />
            Training & Activity
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            Global enablement tracking and granular user activity logs.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("certs")}
          className={`pb-3 text-[13px] font-semibold transition-colors relative ${
            activeTab === "certs"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Certifications
          {activeTab === "certs" && (
            <span
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full"
              style={{ background: "var(--color-basil-green)" }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`pb-3 text-[13px] font-semibold transition-colors relative ${
            activeTab === "activity"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Activity Tracer
          {activeTab === "activity" && (
            <span
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full"
              style={{ background: "var(--color-basil-green)" }}
            />
          )}
        </button>
      </div>

      <div className="pt-2">
        {activeTab === "certs" ? (
          <CertificationsPage onNavigateToActivity={onNavigateToActivity} />
        ) : (
          <PartnerActivityPage 
            initialPartner={activityPartnerFilter || undefined}
            initialCourse={activityCourseFilter || undefined}
            initialSearch={activitySearchFilter || undefined}
            onClearFilters={onClearFilters}
          />
        )}
      </div>
    </div>
  );
}
