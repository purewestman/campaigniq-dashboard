import { useMemo } from "react";
import { GraduationCap, Award, PhoneCall, Mail } from "lucide-react";
import { useModifications } from "@/contexts/ModificationContext";
import { Badge } from "@/components/ui/badge";

interface TrainingRecord {
  id: string;
  partnerName: string;
  email: string;
  certs: string[];
  count: number;
  rating: "None" | "Novice" | "Proficient" | "Expert";
  isNextToSpeakTo: boolean;
}

export default function TrainingDetailsPage() {
  const { modifiedPartners } = useModifications();

  const trainingData = useMemo(() => {
    const records: TrainingRecord[] = [];

    modifiedPartners.forEach((partner) => {
      // Find the person with the max certs to mark as "champion"/next to speak to
      let maxCerts = -1;
      let championEmail: string | null = null;

      if (partner.exams.length > 0) {
        partner.exams.forEach((exam) => {
          if (exam.certifications.length > maxCerts) {
            maxCerts = exam.certifications.length;
            championEmail = exam.email;
          }
        });
      }

      // If no exams, pick the first target email
      if (partner.exams.length === 0 && partner.targetEmails.length > 0) {
        championEmail = partner.targetEmails[0];
        records.push({
          id: `${partner.id}-${championEmail}`,
          partnerName: partner.name,
          email: championEmail,
          certs: [],
          count: 0,
          rating: "None",
          isNextToSpeakTo: true,
        });
      } else {
        // Add all exam records for this partner
        partner.exams.forEach((exam) => {
          const count = exam.certifications.length;
          let rating: TrainingRecord["rating"] = "None";
          if (count === 1) rating = "Novice";
          else if (count >= 2 && count <= 3) rating = "Proficient";
          else if (count >= 4) rating = "Expert";

          records.push({
            id: `${partner.id}-${exam.email}`,
            partnerName: partner.name,
            email: exam.email,
            certs: exam.certifications,
            count,
            rating,
            isNextToSpeakTo: exam.email === championEmail,
          });
        });
      }
    });

    // Sort by Partner Name, then by count descending
    return records.sort((a, b) => {
      if (a.partnerName < b.partnerName) return -1;
      if (a.partnerName > b.partnerName) return 1;
      return b.count - a.count;
    });
  }, [modifiedPartners]);

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-blue-500" />
          Training Breakdown per Person
        </h2>
        <p className="text-[13px] text-muted-foreground mt-1">
          Detailed view of online training and certifications completed by individuals.
        </p>
      </div>

      <div className="terrain-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b" style={{ borderColor: 'oklch(0.58 0.16 290 / 0.12)' }}>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Partner</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Contact Details</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Count</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Training Completed</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider text-center">Rating</th>
                <th className="py-3 px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {trainingData.map((row) => (
                <tr key={row.id} className="hover:bg-black/[0.02] transition-colors">
                  <td className="py-4 px-4 text-[13px] font-medium text-foreground align-top">
                    {row.partnerName}
                  </td>
                  <td className="py-4 px-4 align-top">
                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      {row.email}
                    </div>
                  </td>
                  <td className="py-4 px-4 text-center align-top">
                    <div className="flex items-center justify-center gap-1.5 font-semibold text-[13px] mt-0.5">
                       {row.count > 0 ? row.count : "—"}
                      {row.count > 0 && <Award className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                  </td>
                  <td className="py-4 px-4 align-top">
                    {row.certs.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {row.certs.map((cert, i) => (
                          <span key={i} className="text-[11px] px-2 py-0.5 rounded border border-black/10 bg-white text-muted-foreground whitespace-nowrap">
                            {cert}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/50 italic">No courses recorded</span>
                    )}
                  </td>
                  <td className="py-4 px-4 text-center align-top">
                    {row.rating === "Expert" && (
                      <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 mt-0.5">Expert</Badge>
                    )}
                    {row.rating === "Proficient" && (
                      <Badge className="bg-teal-100 text-teal-700 hover:bg-teal-200 mt-0.5">Proficient</Badge>
                    )}
                    {row.rating === "Novice" && (
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 mt-0.5">Novice</Badge>
                    )}
                    {row.rating === "None" && (
                      <Badge variant="outline" className="text-muted-foreground border-dashed mt-0.5">No Training</Badge>
                    )}
                  </td>
                  <td className="py-4 px-4 align-top">
                    {row.isNextToSpeakTo ? (
                      <div className="flex items-center gap-1.5 text-[12px] font-semibold text-rose-600 bg-rose-50 w-max px-2.5 py-1 rounded-full border border-rose-100 mt-0.5">
                        <PhoneCall className="w-3.5 h-3.5" />
                        Next to Contact
                      </div>
                    ) : (
                      <span className="text-[12px] text-muted-foreground/50 mt-1 block">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {trainingData.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[13px] text-muted-foreground">
                    No individual training data available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
