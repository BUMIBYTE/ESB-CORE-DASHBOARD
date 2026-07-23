import React from "react";
import {
  Settings as GeneralIcon,
  Shield,
  KeyRound,
  Users,
  Bell,
  CreditCard,
  ArrowRight,
  Sparkles,
} from "lucide-react";

// Data dummy sesuai dengan teks pada gambar
const SETTINGS_ITEMS = [
  {
    id: "general",
    title: "General",
    description: "Display name, region, default timezone",
    icon: GeneralIcon,
  },
  {
    id: "security",
    title: "Security",
    description: "SSO, session policies, IP allowlist",
    icon: Shield,
  },
  {
    id: "api-keys",
    title: "API keys",
    description: "Issue and rotate platform tokens",
    icon: KeyRound,
  },
  {
    id: "members",
    title: "Members",
    description: "Invite, manage and offboard team members",
    icon: Users,
  },
  {
    id: "notifications",
    title: "Notifications",
    description: "Email, Slack, PagerDuty, Webhook routing",
    icon: Bell,
  },
  {
    id: "billing",
    title: "Billing",
    description: "Plan, invoices, tenant quotas",
    icon: CreditCard,
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-[#06090e] text-slate-300 p-8 font-sans select-none relative">
      {/* HEADER SECTION */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          Settings
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Workspace, security, and platform configuration
        </p>
      </div>

      {/* GRID CARDS (2 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl">
        {SETTINGS_ITEMS.map((item) => {
          const IconComponent = item.icon;
          return (
            <div
              key={item.id}
              className="bg-[#0e1420] border border-slate-800/80 hover:border-slate-700/80 rounded-xl p-5 flex items-center justify-between group cursor-pointer transition-all"
            >
              <div className="flex items-center gap-4">
                {/* Icon Box */}
                <div className="w-10 h-10 rounded-lg bg-[#141c2c] border border-slate-700/40 flex items-center justify-center shrink-0">
                  <IconComponent className="w-4 h-4 text-blue-400" />
                </div>

                {/* Text Details */}
                <div>
                  <h3 className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {item.description}
                  </p>
                </div>
              </div>

              {/* Right Arrow */}
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-slate-300 group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
            </div>
          );
        })}
      </div>
    </div>
  );
}