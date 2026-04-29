/**
 * CoachSidebar — porting da prototipo (src/app.jsx Sidebar function).
 * Sidebar identica visivamente, ma:
 * - Le voci nav sono link client-side React Router invece di state-based
 * - Footer mostra il profilo dell'utente loggato (non Marco hardcoded)
 */

import { Link, useLocation } from "react-router-dom";
import { Icon, IconName, Avatar } from "../ui";
import { useAuth } from "../../lib/auth";
import { useNotifications } from "../../lib/notifications";

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  to: string;
  badgeKey?: "review" | "chat";
}

const COACH_NAV: NavItem[] = [
  { id: "dashboard", label: "Overview", icon: "home", to: "/coach/dashboard" },
  { id: "students", label: "Studenti", icon: "grid", to: "/coach/studenti" },
  { id: "team", label: "Team coach", icon: "users", to: "/coach/team" },
  { id: "library", label: "Libreria", icon: "book", to: "/coach/libreria" },
  { id: "review", label: "Da correggere", icon: "inbox", to: "/coach/review", badgeKey: "review" },
  { id: "chat", label: "Chat", icon: "chat", to: "/coach/chat", badgeKey: "chat" },
  { id: "settings", label: "Impostazioni", icon: "settings", to: "/coach/impostazioni" },
];

export function CoachSidebar() {
  const { profile, signOut } = useAuth();
  const location = useLocation();
  const { unreadMessages, pendingReviews } = useNotifications();
  const badgeForKey = (key?: "review" | "chat") => {
    if (key === "review") return pendingReviews;
    if (key === "chat") return unreadMessages;
    return 0;
  };

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
    <aside className="hidden md:flex w-[248px] bg-ink text-paper flex-col border-r border-line-dark min-h-screen">
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
          const badgeCount = badgeForKey(it.badgeKey);
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
              {badgeCount > 0 && (
                <span
                  className={
                    "text-[10px] font-mono px-1.5 min-w-5 h-5 rounded-full flex items-center justify-center " +
                    (active ? "bg-black/20 text-black" : "bg-[var(--ember)] text-white")
                  }
                  style={{ fontWeight: 700 }}
                >
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer profilo utente loggato + logout */}
      <div className="px-4 py-4 border-t border-line-dark">
        <div className="flex items-center gap-3 mb-3">
          <Avatar
            initials={initials}
            size={34}
            tone="ember"
            imageUrl={profile?.avatar_url ?? null}
          />
          <div className="flex-1 min-w-0">
            <div className="text-[13px] truncate">{fullName}</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#9E8E82]">
              {roleLabel}
            </div>
          </div>
        </div>
        <button
          onClick={signOut}
          className="w-full h-8 rounded-[2px] border border-line-dark text-[10px] font-mono uppercase tracking-wider text-[#9E8E82] hover:text-paper hover:border-[#4A3A32] transition"
        >
          Esci
        </button>
      </div>
    </aside>
  );
}
