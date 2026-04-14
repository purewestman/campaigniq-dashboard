import { useState, useEffect } from "react";
import CalendarRoadmap from "@/components/CalendarRoadmap";
import SEJourneyMap from "@/components/SEJourneyMap";
import CorePlatforms from "@/components/CorePlatforms";
import CommitmentTracker, { loadCommitments, type PartnerCommitment } from "@/components/CommitmentTracker";
import { useAuth } from "@/contexts/AuthContext";
import { Map as MapIcon, CalendarDays, CalendarCheck } from "lucide-react";

export default function PlanningHub() {
  const [activeTab, setActiveTab] = useState<"journey" | "calendar" | "commitments">("journey");
  
  const { user } = useAuth();
  const [commitments, setCommitments] = useState<PartnerCommitment[]>([]);

  useEffect(() => {
    const allCommitments = loadCommitments();
    if (user?.role === 'admin') {
      setCommitments(allCommitments);
    } else if (user?.role === 'partner') {
      setCommitments(allCommitments.filter(c => c.partnerName === user.name));
    } else {
      setCommitments([]);
    }
  }, [user]);

  const handleDeleteCommitment = (id: string) => {
    const fresh = loadCommitments().filter((c: any) => c.id !== id);
    localStorage.setItem("pei-partner-commitments", JSON.stringify(fresh));
    setCommitments(fresh);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <MapIcon className="w-5 h-5" style={{ color: "var(--color-basil-green)" }} />
            Strategic Planning
          </h2>
          <p className="text-[13px] text-muted-foreground mt-1">
            SE Journey maps, RSA Initiative timelines, and Partner Commitments.
          </p>
        </div>
      </div>

      <div className="flex gap-4 border-b">
        <button
          onClick={() => setActiveTab("journey")}
          className={`pb-3 text-[13px] font-semibold transition-colors flex items-center gap-1.5 relative ${
            activeTab === "journey"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <MapIcon className="w-4 h-4" /> SE Journey Map
          {activeTab === "journey" && (
            <span
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full"
              style={{ background: "var(--color-basil-green)" }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("calendar")}
          className={`pb-3 text-[13px] font-semibold transition-colors flex items-center gap-1.5 relative ${
            activeTab === "calendar"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarDays className="w-4 h-4" /> 12-Month Calendar
          {activeTab === "calendar" && (
            <span
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full"
              style={{ background: "var(--color-basil-green)" }}
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("commitments")}
          className={`pb-3 text-[13px] font-semibold transition-colors flex items-center gap-1.5 relative ${
            activeTab === "commitments"
              ? "text-foreground"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          <CalendarCheck className="w-4 h-4" /> Exported Commitments
          {activeTab === "commitments" && (
            <span
              className="absolute bottom-0 left-0 w-full h-[2px] rounded-t-full"
              style={{ background: "var(--color-basil-green)" }}
            />
          )}
        </button>
      </div>

      <div className="pt-2">
        {activeTab === "journey" && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2">
              <SEJourneyMap />
            </div>
            <div className="xl:col-span-1">
              <CorePlatforms />
            </div>
          </div>
        )}
        
        {activeTab === "calendar" && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
             <CalendarRoadmap />
          </section>
        )}

        {activeTab === "commitments" && (
          <CommitmentTracker 
            commitments={commitments} 
            onDelete={handleDeleteCommitment} 
            onUpdate={() => setCommitments(loadCommitments())}
          />
        )}
      </div>
    </div>
  );
}
