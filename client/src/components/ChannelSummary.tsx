/*
 * Channel Summary Cards — "Soft Terrain" design
 * Three horizontal cards showing Social, Search, Email key stats
 */

import { motion } from "framer-motion";
import { channelData } from "@/lib/data";
import { Share2, Search, Mail } from "lucide-react";

const channelIcons: Record<string, React.ElementType> = {
  Social: Share2,
  Search: Search,
  Email: Mail,
};

const channelStyles: Record<string, { gradient: string; iconBg: string; iconColor: string }> = {
  Social: {
    gradient: "linear-gradient(135deg, oklch(0.60 0.12 175 / 0.06), oklch(0.60 0.12 175 / 0.01))",
    iconBg: "oklch(0.60 0.12 175 / 0.12)",
    iconColor: "oklch(0.50 0.12 175)",
  },
  Search: {
    gradient: "linear-gradient(135deg, oklch(0.58 0.16 290 / 0.06), oklch(0.58 0.16 290 / 0.01))",
    iconBg: "oklch(0.58 0.16 290 / 0.12)",
    iconColor: "oklch(0.48 0.16 290)",
  },
  Email: {
    gradient: "linear-gradient(135deg, oklch(0.75 0.14 75 / 0.06), oklch(0.75 0.14 75 / 0.01))",
    iconBg: "oklch(0.75 0.14 75 / 0.12)",
    iconColor: "oklch(0.60 0.14 75)",
  },
};

export default function ChannelSummary() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {channelData.map((ch, i) => {
        const Icon = channelIcons[ch.channel] || Share2;
        const style = channelStyles[ch.channel];

        return (
          <motion.div
            key={ch.channel}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55 + i * 0.08, duration: 0.4 }}
            className="terrain-card p-5 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: style.gradient }}
            />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: style.iconBg }}
                >
                  <Icon className="w-4 h-4" style={{ color: style.iconColor }} />
                </div>
                <h4 className="text-[14px] font-bold text-foreground">{ch.channel}</h4>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Impressions
                  </p>
                  <p className="text-[15px] font-bold text-foreground">
                    {(ch.impressions / 1000).toFixed(0)}k
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Clicks
                  </p>
                  <p className="text-[15px] font-bold text-foreground">
                    {(ch.clicks / 1000).toFixed(1)}k
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Conversions
                  </p>
                  <p className="text-[15px] font-bold text-foreground">
                    {ch.conversions.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-0.5">
                    Spend
                  </p>
                  <p className="text-[15px] font-bold text-foreground">
                    ${(ch.spend / 1000).toFixed(1)}k
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
