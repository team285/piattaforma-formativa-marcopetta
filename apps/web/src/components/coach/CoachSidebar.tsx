/**
 * CoachSidebar — porting da prototipo (src/app.jsx Sidebar function).
 * Sidebar identica visivamente, ma:
 * - Le voci nav sono link client-side React Router invece di state-based
 * - Footer mostra il profilo dell'utente loggato (non Marco hardcoded)
 */

import { Link, useLocation } from "react-router-dom";
import { Icon, IconName, Avatar } from "../ui";
import { useAuth } from "../../lib/auth";

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  to: string;
  badge?: string;
}

const COACH_NAV: NavItem[] = [
  { id: "dashboard", label: "Overview", icon: "home", to: "/preview/coach/dashboard" },
  { id: "students", label: "Studenti", icon: "grid", to: "/preview/coach/studenti" },
  { id: "team", label: "Team coach", icon: "users", to: "/preview/coach/team" },
  { id: "library", label: "Libreria", icon: "book", to: "/preview/coach/libreria" },
  { id: "review", label: "Da correggere", icon: "inbox", to: "/preview/coach/review" },
  { id: "chat", label: "Chat", icon: "chat", to: "/preview/coach/chat" },
  { id: "settings", label: "Impostazioni", icon: "settings", to: "/preview/coach/impostazioni" },
];

export function CoachSidebar() {
  const { profile } = useAuth();
  const location = useLocation();

  const initials = profile?.initials || "—";
  const fullName = profile?.full_name || "—";
  const roleLabel = !profile
    ? "caricamento…"
    : profile.role === "founder"
      ? "fondatore · admin"
      : profile.role === "coach"
        ? "coach"
        : "studente";

  return (
    <aside className="w-[248px] bg-ink text-paper flex flex-col border-r border-line-dark min-h-screen">
      {/* Brand top */}
      <div className="px-5 pt-6 pb-5 border-b border-line-dark">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-[2px] bg-[var(--amber)] flex items-center justify-center font-display text-xl text-black"
            style={{ fontWeight: 900 }}
          >
            P
          </div>
          <div>
            <div className="font-display text-[17px] leading-none">Marco Petta</div>
            <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9E8E82] mt-1">
              metodo p.g.t.
            </div>
          </div>
        </div>
        <div
          className="mt-4 font-display text-[15px] text-[#C9BDB1] leading-[1.05]"
          style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.02em" }}
        >
          Smetti di suonare a caso.
          <br />
          Inizia a <span className="text-[var(--amber)]">capire</span>.
        </div>
      </div>

      {/* Section label */}
      <div className="px-4 pt-4 pb-2">
        <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-[#9E8E82] mb-2 px-1">
          Vista coach · web
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-1 space-y-0.5 overflow-y-auto no-scrollbar">
        {COACH_NAV.map((it) => {
          const active = location.pathname.startsWith(it.to);
          return (
            <Link
              key={it.id}
              to={it.to}
              className={
                "w-full flex items-center gap-3 px-3 h-10 rounded-[2px] text-left transition " +
                (active ? "bg-[var(--amber)] text-black" : "text-[#C9BDB1] hover:bg-ink-2")
              }
            >
              <Icon name={it.icon} size={15} />
              <span className="text-[13px] flex-1" style={active ? { fontWeight: 600 } : {}}>
                {it.label}
              </span>
              {it.badge && (
                <span
                  className={
                    "text-[10px] font-mono px-1.5 h-5 rounded-full flex items-center " +
                    (active ? "bg-black/20 text-black" : "bg-[var(--amber)] text-black")
                  }
                  style={{ fontWeight: 700 }}
                >
                  {it.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer profilo utente loggato */}
      <div className="px-4 py-4 border-t border-line-dark flex items-center gap-3">
        <Avatar initials={initials} size={34} tone="ember" />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] truncate">{fullName}</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">
            {roleLabel}
          </div>
        </div>
      </div>
    </aside>
  );
}
