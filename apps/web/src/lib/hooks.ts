/**
 * Hook utility riusabili per UX comune (scroll lock, page title, visibility).
 */

import { useEffect } from "react";

/**
 * useBodyScrollLock — blocca lo scroll del body mentre il drawer/modal è aperto.
 * Salva lo scroll position prima e lo ripristina alla chiusura, evitando il
 * "salto in alto" tipico di body { overflow: hidden }.
 */
export function useBodyScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    const prevTop = document.body.style.top;
    const prevPosition = document.body.style.position;
    const prevWidth = document.body.style.width;

    document.body.style.overflow = "hidden";
    // iOS Safari richiede position:fixed altrimenti il body scrolla comunque
    document.body.style.position = "fixed";
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = "100%";

    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.position = prevPosition;
      document.body.style.top = prevTop;
      document.body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [active]);
}

/**
 * usePageTitle — aggiorna document.title alla mount + ripristina alla unmount.
 * Suffisso fisso "· MPCoach" per coerenza brand.
 */
export function usePageTitle(title: string) {
  useEffect(() => {
    const prev = document.title;
    document.title = title ? `${title} · MPCoach` : "MPCoach · Marco Petta";
    return () => {
      document.title = prev;
    };
  }, [title]);
}

/**
 * useTabVisibility — chiama callback quando la tab torna visibile.
 * Utile per refetch quando l'utente torna su un tab dopo che è stato in
 * background per molto tempo (Realtime potrebbe aver perso eventi).
 */
export function useTabVisibility(onVisible: () => void) {
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === "visible") onVisible();
    };
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [onVisible]);
}
