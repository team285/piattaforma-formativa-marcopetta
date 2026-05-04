/**
 * ErrorBoundary — cattura errori di render React e chunk loading failure.
 *
 * Casi tipici coperti:
 *  1. Componente lazy che non riesce a caricare il chunk (deploy in corso,
 *     l'utente ha un tab vecchio aperto, il vecchio JS non esiste più su CDN)
 *  2. Crash inaspettato in render (TypeError, ecc) che senza boundary
 *     produrrebbe schermata bianca senza nessun feedback all'utente.
 *
 * Niente librerie esterne (Sentry, Bugsnag) — log su console + UI fallback
 * con bottone "ricarica" che è la cosa giusta nel 90% dei casi.
 */

import { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  isChunkError: boolean;
}

function isChunkLoadError(error: Error | null): boolean {
  if (!error) return false;
  // Vite/webpack: errori del tipo "Failed to fetch dynamically imported module"
  // o "Loading chunk X failed". Quasi sempre risolti con un hard refresh.
  const msg = error.message || "";
  return (
    msg.includes("Failed to fetch dynamically imported module") ||
    msg.includes("Loading chunk") ||
    msg.includes("Importing a module script failed") ||
    error.name === "ChunkLoadError"
  );
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null, isChunkError: false };

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      isChunkError: isChunkLoadError(error),
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[ErrorBoundary] Crash:", error, info);
  }

  reload = () => {
    // Hard reload pulisce cache + richiama HTML, scarica nuovo bundle
    window.location.reload();
  };

  goHome = () => {
    window.location.href = "/";
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    const { isChunkError, error } = this.state;

    return (
      <div className="min-h-screen-safe bg-ink text-paper flex items-center justify-center px-5 md:px-10">
        <div className="max-w-md text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--ember)] mb-3">
            {isChunkError ? "Aggiornamento disponibile" : "Errore inatteso"}
          </div>
          <h1 className="font-editorial text-[40px] md:text-[56px] mb-5 leading-tight">
            {isChunkError ? (
              <>
                C'è una <span className="italic-ember">nuova versione</span>.
              </>
            ) : (
              <>
                Qualcosa <span className="italic-ember">non torna</span>.
              </>
            )}
          </h1>
          <p className="text-smoke-2 text-[14px] leading-relaxed mb-7">
            {isChunkError
              ? "L'app è stata aggiornata mentre la stavi usando. Ricarica la pagina per usare la versione più recente — non perderai dati."
              : "Si è verificato un errore non previsto. Ricarica la pagina per riprovare. Se il problema persiste, contatta Marco."}
          </p>
          {error && !isChunkError && (
            <pre className="text-[10px] font-mono text-smoke text-left bg-ink-2 border border-line-dark rounded-[3px] p-3 mb-6 overflow-auto max-h-32">
              {error.message}
            </pre>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.reload}
              className="h-11 px-5 rounded-[2px] bg-amber text-ink font-display tracking-wider text-[13px] uppercase hover:bg-amber-2 transition"
              style={{ fontWeight: 700 }}
            >
              Ricarica
            </button>
            {!isChunkError && (
              <button
                onClick={this.goHome}
                className="h-11 px-5 rounded-[2px] border border-line-dark text-[13px] font-mono uppercase tracking-wider text-[#C9BDB1] hover:text-paper hover:border-[#4A3A32] transition"
              >
                Torna alla home
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
}
