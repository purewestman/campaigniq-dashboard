import { ChevronRight, Wrench } from 'lucide-react';

const tools = [
  { name: "Partner Central", url: "https://purestorage.my.site.com/partners/s/" },
  { name: "Partner Academy – Training Catalogue", url: "https://partneracademy.purestorage.com/student/catalog" },
  { name: "Partner Library", url: "https://purestorage.my.site.com/partners/s/" },
  { name: "Sales Tools Landing Page", url: "https://salestools.purestorage.com/landing/#/" },
  { name: "Pure Test Drive", url: "https://testdrive.purestorage.com/user/labs" },
  { name: "Partner Intelligence", url: "https://pi.purestorage.com" },
  { name: "Pure Realize", url: "https://realize.purestorage.com" },
  { name: "Pure Community", url: "https://purecommunity.purestorage.com" },
  { name: "Pure//CODE", url: "https://code.purestorage.com" },
  { name: "Compete Bot for Partners", url: "https://purestorage.my.site.com/partners/s/" }
];

export default function CorePlatforms() {
  return (
    <div className="terrain-card p-8 bg-slate-50 border border-slate-200 h-full">
      <div className="mb-8">
        <h2 className="text-[20px] font-bold text-slate-900 border-b-2 inline-block pb-1 border-basil-green flex items-center gap-2">
          <Wrench className="w-5 h-5 text-basil-green" /> Core Platforms & Tools
        </h2>
        <p className="text-[13px] text-slate-500 mt-3 font-medium">
          What every Partner SE should be using to design, size, quote, and demonstrate Everpure solutions.
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {tools.map((tool, idx) => (
          <a 
            key={idx} 
            href={tool.url} 
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white p-5 rounded-xl shadow-sm border border-slate-200 hover:border-pure-orange hover:shadow-md transition-all flex items-center justify-between"
          >
            <span className="font-bold text-[13px] text-slate-800 group-hover:text-pure-orange transition-colors">{tool.name}</span>
            <div className="w-6 h-6 rounded-full bg-slate-50 flex items-center justify-center group-hover:bg-pure-orange/10 transition-colors">
              <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-pure-orange transition-colors" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
