/**
 * NotificationsPermission — banner riusabile per richiedere il permesso
 * delle notifiche browser native. Mostra stato corrente + bottone azione.
 */

import { useNotifications } from "../lib/notifications";
import { Icon } from "./ui";

interface Props {
  variant?: "ink" | "paper";
}

export function NotificationsPermission({ variant = "paper" }: Props) {
  const { browserPermission, requestPermission } = useNotifications();

  if (browserPermission === "unsupported") {
    return null;
  }

  const isInk = variant === "ink";
  const baseClass = isInk
    ? "bg-ink-2 border-line-dark text-paper"
    : "bg-paper-2 border-line text-ink";

  if (browserPermission === "granted") {
    return (
      <div className={`border rounded-[3px] p-4 flex items-center gap-3 ${baseClass}`}>
        <div className="w-9 h-9 rounded-full bg-[#7BB07B]/15 border border-[#7BB07B]/40 flex items-center justify-center text-[#7BB07B] flex-shrink-0">
          <Icon name="check" size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium">Notifiche attivate</div>
          <div className={"text-[11px] mt-0.5 " + (isInk ? "text-[#9A9AA2]" : "text-smoke")}>
            Riceverai una notifica anche quando l'app è in background.
          </div>
        </div>
      </div>
    );
  }

  if (browserPermission === "denied") {
    return (
      <div className={`border rounded-[3px] p-4 flex items-center gap-3 ${baseClass}`}>
        <div className="w-9 h-9 rounded-full bg-[var(--ember)]/15 border border-[var(--ember)]/40 flex items-center justify-center text-[var(--ember)] flex-shrink-0">
          <Icon name="warning" size={14} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-medium">Notifiche bloccate</div>
          <div className={"text-[11px] mt-0.5 " + (isInk ? "text-[#9A9AA2]" : "text-smoke")}>
            Riabilitale dalle impostazioni del browser (icona lucchetto a sinistra dell'URL).
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-[3px] p-4 flex items-center gap-3 ${baseClass}`}>
      <div className="w-9 h-9 rounded-full bg-[var(--amber)]/15 border border-[var(--amber)]/40 flex items-center justify-center text-[var(--amber)] flex-shrink-0">
        <Icon name="inbox" size={14} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-medium">Attiva le notifiche</div>
        <div className={"text-[11px] mt-0.5 " + (isInk ? "text-[#9A9AA2]" : "text-smoke")}>
          Ricevi un avviso quando arriva un nuovo messaggio o un feedback, anche con l'app chiusa.
        </div>
      </div>
      <button
        onClick={requestPermission}
        className="h-8 px-3 rounded-[2px] bg-[var(--amber)] text-ink text-[11px] font-mono uppercase tracking-wider hover:bg-[var(--amber-2)] transition flex-shrink-0"
        style={{ fontWeight: 700 }}
      >
        Attiva
      </button>
    </div>
  );
}
