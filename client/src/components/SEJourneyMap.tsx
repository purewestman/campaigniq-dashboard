import { 
  CheckCircle2, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp,
  ExternalLink,
  MonitorPlay,
  Cpu
} from 'lucide-react';

const colors = {
  pureOrange: 'var(--color-pure-orange, #FF7023)',
  cloudWhite: 'var(--color-cloud-white, #FFF5E3)',
  ashGray: 'var(--color-ash-gray, #2D2A27)',
  stoneGray: 'var(--color-stone-gray, #D0C8BA)',
  basilGreen: 'var(--color-basil-green, #5A6359)',
  clayPink: 'var(--color-clay-pink, #95685D)',
  walnutBrown: 'var(--color-walnut-brown, #71584C)'
};

const journeySteps = [
  {
    id: 1,
    title: "Foundation – Simply Pure for Partners",
    icon: <BookOpen className="w-5 h-5 text-white" />,
    color: "bg-[#FF7023]",
    purpose: "Introduce Pure/Everpure, basic value prop and portfolio, and unlock Rewards eligibility for individuals.",
    outcomes: "Understand what Everpure does and the portfolio at a high level. Become eligible for Pure Rewards.",
    notes: "Taken once per person and does not expire. Must be completed before a deal closes to receive Rewards.",
    links: [
      { text: "Simply Pure for Partners – Partner Academy", url: "https://partneracademy.purestorage.com/student/activity/1999196" }
    ]
  },
  {
    id: 2,
    title: "Core Technical Ramp – Technical Sales Professional (TSP)",
    icon: <MonitorPlay className="w-5 h-5 text-white" />,
    color: "bg-[#71584C]",
    purpose: "Provide a ~6-hour on-demand technical sales curriculum teaching Partner SEs how to position the Enterprise Data Cloud (EDC).",
    outcomes: "Confidently articulate and whiteboard the EDC architecture. Position main solution areas (File/Object, Fusion, AI, Cyber, Cloud).",
    notes: "Mandatory prerequisite for Partner SE Bootcamp FY27. For Elite, completed annually for a defined number of SEs.",
    links: [
      { text: "Technical Sales Professional Learning Path (FY27)", url: "https://partneracademy.purestorage.com/student/path/3099159" },
      { text: "Technical Sales Professional FY27 – Partner Central", url: "https://purestorage.my.site.com/partners/s/enablementprogram/0Qocw00000000pdCAA/technical-sales-professional-fy27" }
    ]
  },
  {
    id: 3,
    title: "In-Person Core Immersion – Partner SE Bootcamp",
    icon: <Users className="w-5 h-5 text-white" />,
    color: "bg-[#5A6359]",
    purpose: "One-day, in-person workshop that turns TSP theory into deep technical understanding and demos.",
    outcomes: "Ability to deliver a technical EDC pitch and explain Fusion, file/object, and solution areas at depth. Familiarity with sizing tools.",
    notes: "Bootcamp and Purely Technical 2-day events both satisfy the requirement. Must be enrolled in Intellum.",
    links: [
      { text: "Partner SE Bootcamp – Partner Academy", url: "https://partneracademy.purestorage.com/student/page/2420173-pure-storage-partner-se-bootcamp?course_session_id=551394" },
      { text: "My Events – Partner Academy", url: "https://partneracademy.purestorage.com/student/my_events" }
    ]
  },
  {
    id: 4,
    title: "Architecture & Solution Depth – EDC + Alliances",
    icon: <Cpu className="w-5 h-5 text-white" />,
    color: "bg-[#95685D]",
    purpose: "Take Partner SEs from 'competent on core platform' to architect-level understanding of EDC and joint solutions.",
    outcomes: "Architect-level design, joint solutions (AI factories, cyber alliances). Required for Ambassador tier.",
    notes: "Weighted heavily towards Ambassador tier and for solution practices.",
    links: [
      { text: "How to Build an Enterprise Data Cloud (For Partner SE)", url: "https://employeeacademy.purestorage.com/student/activity/2854893-how-to-build-an-enterprise-data-cloud-for-partner-se" },
      { text: "Alliance Offerings – Partner Central", url: "https://purestorage.my.site.com/partners/s/" }
    ]
  },
  {
    id: 5,
    title: "Electives & Deep Technical Mastery",
    icon: <TrendingUp className="w-5 h-5 text-white" />,
    color: "bg-[#8FA596]", // Note: No direct pure brand equivalent yet but close to a muted moss
    purpose: "Allow Partner SEs to specialise by workload or solution area and prepare for certifications.",
    outcomes: "Specialise in Cyber Resilience, AI, App Mod / Portworx, Databases and Applications.",
    notes: "Recommended to differentiate solution practices and support certification readiness.",
    links: [
      { text: "Partner Academy – Training Catalogue", url: "https://partneracademy.purestorage.com/student/catalog" },
      { text: "Partner Library (via Partner Central)", url: "https://purestorage.my.site.com/partners/s/" }
    ]
  },
  {
    id: 6,
    title: "Certification & Practice Specializations",
    icon: <Award className="w-5 h-5 text-white" />,
    color: "bg-[#2D2A27]",
    purpose: "Formalise advanced capability for both individuals (SE certification) and entities (services/practices).",
    outcomes: "FlashArray/FlashBlade Architect. Certified Implementation Partner (CIP). Solution practice designations.",
    notes: "Core for Ambassador tier compliance metrics.",
    links: [
      { text: "Architect Associate Certification", url: "https://www.purestorage.com/partners/certifications/flasharray-architect-associate.html" },
      { text: "Implementation Specialization – Orientation", url: "https://docs.google.com/presentation/d/1t_YgnLQCRw7h3uRGWqpE_zyYWDN6VH1oC2kQfOEAJ_Y" }
    ]
  }
];

export default function SEJourneyMap() {
  return (
    <div className="terrain-card p-8 bg-white border border-slate-200">
      <div className="mb-10">
        <h2 className="text-[22px] font-bold text-slate-900 border-b-2 inline-block pb-1 border-pure-orange">The Global SE Journey Map</h2>
        <p className="text-[14px] text-slate-500 mt-3 font-medium">
          Follow these six official steps to skill up, fulfill tier requirements (Elite/Ambassador), and become a certified technical expert.
        </p>
        <div className="mt-8 mb-4 border border-slate-200 rounded-xl overflow-hidden shadow-sm bg-slate-50 flex justify-center">
          <img 
            src="/se-journey-graphic.png" 
            alt="SE Journey 6-Step Map" 
            className="w-full max-w-[800px] h-auto mix-blend-multiply"
          />
        </div>
      </div>
      
      <div className="relative border-l-2 border-slate-200 ml-4 md:ml-6 space-y-10 pb-4">
        {journeySteps.map((step) => (
          <div key={step.id} className="relative pl-8 md:pl-12 group">
            {/* Timeline Dot/Icon */}
            <div 
              className={`absolute -left-[18px] top-0 w-9 h-9 rounded-full flex items-center justify-center shadow-sm border-4 border-white transition-transform duration-300 group-hover:scale-110 ${step.color}`}
            >
              {step.icon}
            </div>
            
            {/* Content Card */}
            <div className="bg-slate-50 rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-300 hover:border-slate-300">
              <div className="text-[10px] font-black tracking-[2px] uppercase mb-1.5" style={{ color: colors.pureOrange }}>
                Step {step.id}
              </div>
              <h3 className="text-lg font-bold mb-4 text-slate-900">{step.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-5">
                <div>
                  <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5"/> Purpose
                  </h4>
                  <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{step.purpose}</p>
                </div>
                <div>
                  <h4 className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5"/> Outcomes
                  </h4>
                  <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{step.outcomes}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-3.5 mb-5 border border-slate-200/60 shadow-sm text-[12px]">
                <span className="font-bold text-slate-900 mr-2 uppercase tracking-tight text-[11px]">Program Note:</span>
                <span className="text-slate-600 font-medium italic">{step.notes}</span>
              </div>

              <div>
                <h4 className="text-[11px] font-bold text-slate-400 mb-2 uppercase tracking-wide">Required Links / Actions:</h4>
                <div className="flex flex-wrap gap-2">
                  {step.links.map((link, idx) => (
                    <a 
                      key={idx} 
                      href={link.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-[12px] font-bold text-white bg-slate-800 hover:bg-pure-orange px-3 py-1.5 rounded-lg transition-colors"
                    >
                      {link.text}
                      <ExternalLink className="w-3.5 h-3.5 ml-1.5 opacity-70" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
