/**
 * Student Community — hub social degli studenti.
 *
 * MVP: vista "in arrivo" con teaser editoriale. La community richiede
 * uno schema dedicato (community_posts, post_reactions, post_comments)
 * che non è ancora migrato. Lo aggiungeremo in una fase successiva
 * quando Marco avrà più di un manciata di studenti attivi.
 */

import { Link } from "react-router-dom";
import { EmberButton, Icon } from "../../components/ui";

export function StudentCommunity() {
  return (
    <div className="min-h-full bg-paper fade-in">
      <div className="max-w-[1180px] mx-auto px-5 md:px-12 py-8 md:py-12">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8 md:mb-10">
          <div>
            <div className="font-mono text-[11px] uppercase tracking-[0.22em] text-smoke mb-3 md:mb-5">
              Hub · in arrivo
            </div>
            <h1 className="font-editorial text-[36px] md:text-[60px] max-w-[720px] leading-[1.05]">
              <span className="italic-ember">Ascoltatevi</span>
              <br />
              tra di voi.
            </h1>
            <p className="text-[15px] text-smoke max-w-[520px] mt-5 leading-relaxed">
              Tutti gli studenti di Marco condivideranno qui le loro take. Niente like, niente
              punteggi. Ascolti, applausi, commenti — come in una sala prove vera.
            </p>
          </div>
          <Link to="/student/esercizio">
            <EmberButton size="lg" icon="record">
              Registra il tuo esercizio
            </EmberButton>
          </Link>
        </div>

        {/* Teaser editoriale */}
        <div className="bg-ink text-paper rounded-[3px] p-5 md:p-8 mb-10 md:mb-12 relative overflow-hidden">
          <div
            className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full"
            style={{ background: "radial-gradient(circle, rgba(242,183,68,0.25), transparent 60%)" }}
          />
          <div className="relative grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 md:items-center">
            <div className="md:col-span-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-3 flex items-center gap-2">
                <Icon name="star" size={11} /> pick della settimana · scelta da marco
              </div>
              <div className="font-display text-3xl leading-tight mb-2">
                "Quando saremo in <span className="italic-ember">venti</span>, qui ci sarà la take del
                mese. Una sola. Ascoltata da tutti."
              </div>
              <div className="text-[13px] text-[#C9C9D0] mt-4">— Marco Petta</div>
            </div>
            <div className="md:col-span-5">
              <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#8A8A92] mb-2">
                Quando arriva
              </div>
              <p className="text-[14px] text-[#D9D9DE] leading-[1.55]">
                La Community parte appena Marco ha almeno 10 studenti attivi. Per ora il focus è
                sull'1:1: lezione, esercizio, feedback.
              </p>
            </div>
          </div>
        </div>

        {/* 4 features placeholder */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              t: "Take pubbliche",
              d: "Quando registri un esercizio puoi spuntare 'pubblica nella Community'. Solo le tue, solo se vuoi.",
              i: "video" as const,
            },
            {
              t: "Applausi (no like)",
              d: "Reazione singola: applauso. Niente cuori, niente fuochi. Si ascolta, si applaude, si commenta.",
              i: "star" as const,
            },
            {
              t: "Commenti audio",
              d: "Rispondi con un audio di 30 sec invece che con testo. Più naturale per chi suona.",
              i: "mic" as const,
            },
            {
              t: "Risposta di Marco",
              d: "Quando Marco lascia una risposta pubblica su una take, è un evento. Suona la campanella.",
              i: "chat" as const,
            },
          ].map((f) => (
            <div key={f.t} className="bg-paper-2 border border-line rounded-[3px] p-6">
              <div className="w-9 h-9 rounded-[2px] bg-paper border border-line flex items-center justify-center text-ink mb-4">
                <Icon name={f.i} size={16} />
              </div>
              <div className="font-display text-[20px] mb-2">{f.t}</div>
              <p className="text-[13px] text-smoke leading-[1.5]">{f.d}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
