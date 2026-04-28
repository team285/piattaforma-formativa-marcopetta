import { useAuth } from "../lib/auth";

export default function Home() {
  const { profile, user, signOut } = useAuth();

  if (!profile) {
    return (
      <div className="min-h-screen bg-ink text-paper flex items-center justify-center">
        <div className="text-smoke-2 font-mono text-sm">Caricamento profilo…</div>
      </div>
    );
  }

  const roleColor =
    profile.role === "founder"
      ? "amber"
      : profile.role === "coach"
        ? "amber"
        : "smoke-2";

  const roleLabel =
    profile.role === "founder"
      ? "Fondatore"
      : profile.role === "coach"
        ? "Coach"
        : "Studente";

  return (
    <div className="min-h-screen bg-ink text-paper">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-amber mb-3">
          MPCoach · backend connesso · session attiva
        </div>

        <h1 className="font-editorial text-[54px] leading-[1.05] mb-8">
          Ciao {profile.full_name.split(" ")[0]}.
          <br />
          <span className="italic text-amber">Sei dentro.</span>
        </h1>

        <div className="bg-ink-2 border border-line-dark rounded-[3px] p-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-3">
            Profilo
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-smoke-2 text-xs mb-1">Nome</div>
              <div>{profile.full_name}</div>
            </div>
            <div>
              <div className="text-smoke-2 text-xs mb-1">Email</div>
              <div className="font-mono text-xs">{profile.email}</div>
            </div>
            <div>
              <div className="text-smoke-2 text-xs mb-1">Ruolo</div>
              <div className={`text-${roleColor}`}>{roleLabel}</div>
            </div>
            <div>
              <div className="text-smoke-2 text-xs mb-1">User ID</div>
              <div className="font-mono text-xs text-smoke-2 truncate">
                {user?.id}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-ink-2 border border-line-dark rounded-[3px] p-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-3">
            Cosa funziona già
          </div>
          <ul className="text-sm space-y-2 text-smoke-2">
            <li>✓ Connessione a Supabase (auth.uid: {user?.id?.slice(0, 8)}…)</li>
            <li>✓ RLS policies attive (vedi solo i tuoi dati)</li>
            <li>✓ Magic link login (sei entrato con email)</li>
            <li>✓ Profile creato automaticamente via RPC ensure_profile</li>
            <li>✓ Sei <span className="text-amber">{roleLabel.toLowerCase()}</span></li>
          </ul>
        </div>

        <div className="bg-ink-2 border border-line-dark rounded-[3px] p-6 mb-6">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke-2 mb-3">
            Prossimi passi
          </div>
          <ul className="text-sm space-y-2 text-smoke-2">
            <li>→ Portare le 21 schermate del prototipo qui dentro</li>
            <li>→ Push del codice su GitHub</li>
            <li>→ Deploy su Vercel (mpcoach.vercel.app)</li>
            <li>→ Marco invitato come secondo founder con la sua email vera</li>
          </ul>
        </div>

        <button
          onClick={signOut}
          className="text-smoke-2 hover:text-amber font-mono text-xs uppercase tracking-wider"
        >
          ← Esci
        </button>
      </div>
    </div>
  );
}
