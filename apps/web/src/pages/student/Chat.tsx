/**
 * Student Chat — thread 1:1 con il proprio coach (Marco / coach assegnato).
 *
 * Layout WhatsApp-style nel tema Marco Petta (paper/amber).
 * Connesso a chat_threads + chat_messages reali. Realtime in arrivo.
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, withTimeout } from "../../lib/supabase";
import { useAuth } from "../../lib/auth";
import { Avatar, Icon } from "../../components/ui";

interface Message {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface CoachInfo {
  id: string;
  full_name: string;
  initials: string;
}

const PAL = {
  bodyBg: "#F5F3ED",
  wallpaper: "radial-gradient(rgba(11,11,13,0.04) 1px, transparent 1px)",
  headerBg: "#ECE8DE",
  headerBorder: "#D8D2C4",
  outBubble: "#F2B744",
  outText: "#0B0B0D",
  inBubble: "#0B0B0D",
  inText: "#F5F3ED",
  subtext: "#6D6D75",
  composerBg: "#ECE8DE",
  composerInput: "#FFFFFF",
  composerBorder: "#D8D2C4",
};

export function StudentChat() {
  const { profile } = useAuth();
  const [threadId, setThreadId] = useState<string | null>(null);
  const [coach, setCoach] = useState<CoachInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profile?.id) return;
    let cancelled = false;
    const load = async () => {
      // 1. Trova il thread dello studente
      const threadRes = await withTimeout(
        supabase
          .from("chat_threads")
          .select("id,coach_id")
          .eq("student_id", profile.id)
          .order("last_message_at", { ascending: false, nullsFirst: false })
          .limit(1)
          .maybeSingle(),
        5000,
        { data: null as { id: string; coach_id: string } | null, error: null },
        "chat.thread"
      );
      if (cancelled) return;

      const thread = threadRes.data;
      if (!thread) {
        setThreadId(null);
        setLoading(false);
        return;
      }
      setThreadId(thread.id);

      // 2. Profilo coach
      const coachRes = await withTimeout(
        supabase.from("profiles").select("id,full_name,initials").eq("id", thread.coach_id).maybeSingle(),
        5000,
        { data: null as CoachInfo | null, error: null },
        "chat.coach"
      );
      if (cancelled) return;
      setCoach(coachRes.data);

      // 3. Messaggi
      const msgsRes = await withTimeout(
        supabase
          .from("chat_messages")
          .select("id,sender_id,body,created_at")
          .eq("thread_id", thread.id)
          .order("created_at"),
        5000,
        { data: [] as Message[], error: null },
        "chat.messages"
      );
      if (cancelled) return;
      setMessages((msgsRes.data as Message[]) ?? []);
      setLoading(false);
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [profile?.id]);

  // Auto-scroll a bottom
  useEffect(() => {
    if (scrollerRef.current) scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
  }, [messages.length]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || !threadId || !profile?.id || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId, sender_id: profile.id, body: text })
      .select("id,sender_id,body,created_at")
      .single();
    setSending(false);
    if (error) {
      console.warn("[chat] send error:", error);
      return;
    }
    if (data) {
      setMessages((cur) => [...cur, data as Message]);
      setDraft("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: PAL.bodyBg }}>
        <div className="font-mono text-[12px] text-smoke">Caricamento chat…</div>
      </div>
    );
  }

  if (!threadId || !coach) {
    return (
      <div className="min-h-screen" style={{ background: PAL.bodyBg }}>
        <div className="max-w-2xl mx-auto px-10 py-20 text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.22em] text-smoke mb-3">
            Chat non ancora attiva
          </div>
          <h1 className="font-editorial text-[44px] mb-4">
            Nessun <span className="italic-ember">coach</span> assegnato.
          </h1>
          <p className="text-smoke text-[15px] leading-relaxed max-w-md mx-auto">
            Quando Marco ti assegnerà un coach, qui si aprirà la chat 1:1 — testo, video, audio,
            tutto cifrato end-to-end tra te e il tuo coach.
          </p>
        </div>
      </div>
    );
  }

  const peerName = coach.full_name;
  const peerInitials = coach.initials;

  return (
    <div style={{ background: PAL.bodyBg, height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          background: PAL.headerBg,
          borderBottom: `1px solid ${PAL.headerBorder}`,
          padding: "14px 28px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          flexShrink: 0,
        }}
      >
        <Link
          to="/student/home"
          className="flex items-center gap-1.5 text-[12px] text-smoke hover:text-ink"
          style={{ fontFamily: "JetBrains Mono,monospace", letterSpacing: "0.1em", textTransform: "uppercase" }}
        >
          <Icon name="chevronl" size={13} /> indietro
        </Link>
        <div style={{ width: 1, height: 24, background: PAL.headerBorder, margin: "0 6px" }} />
        <Avatar initials={peerInitials} size={42} tone="ember" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Big Shoulders Display',sans-serif",
              fontWeight: 800,
              fontSize: 20,
              textTransform: "uppercase",
              letterSpacing: "0.01em",
              color: "#0B0B0D",
              lineHeight: 1,
            }}
          >
            {peerName}
          </div>
          <div
            style={{
              fontFamily: "JetBrains Mono,monospace",
              fontSize: 10,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: PAL.subtext,
              marginTop: 4,
            }}
          >
            il tuo coach
          </div>
        </div>
      </div>

      {/* Messaggi */}
      <div
        ref={scrollerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 28px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          backgroundImage: PAL.wallpaper,
          backgroundSize: "18px 18px",
        }}
      >
        <div style={{ maxWidth: 820, width: "100%", margin: "0 auto", display: "flex", flexDirection: "column", gap: 4 }}>
          {messages.length === 0 ? (
            <div
              style={{
                alignSelf: "center",
                background: "rgba(11,11,13,0.06)",
                color: PAL.subtext,
                fontSize: 12,
                padding: "10px 18px",
                borderRadius: 2,
                marginTop: 40,
                fontFamily: "JetBrains Mono,monospace",
                letterSpacing: "0.1em",
                textAlign: "center",
                maxWidth: 480,
              }}
            >
              Inizia la conversazione con {peerName.split(" ")[0]} — chiedi un dubbio, manda un audio,
              ringrazialo per il feedback.
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.sender_id === profile?.id;
              const prev = messages[i - 1];
              const grouped = prev && prev.sender_id === m.sender_id;
              const time = new Date(m.created_at).toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
              return (
                <div
                  key={m.id}
                  style={{
                    display: "flex",
                    justifyContent: isMe ? "flex-end" : "flex-start",
                    marginTop: grouped ? 1 : 8,
                    padding: "0 4px",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "65%",
                      background: isMe ? PAL.outBubble : PAL.inBubble,
                      color: isMe ? PAL.outText : PAL.inText,
                      borderRadius: 3,
                      borderTopLeftRadius: !isMe && !grouped ? 0 : 3,
                      borderTopRightRadius: isMe && !grouped ? 0 : 3,
                      padding: "8px 12px",
                      fontSize: 14.5,
                      lineHeight: 1.5,
                      position: "relative",
                      boxShadow: isMe ? "0 2px 6px rgba(242,183,68,0.25)" : "0 2px 6px rgba(11,11,13,0.18)",
                      minWidth: 80,
                    }}
                  >
                    <div style={{ paddingRight: 50, paddingBottom: 2, whiteSpace: "pre-wrap" }}>{m.body}</div>
                    <div
                      style={{
                        position: "absolute",
                        bottom: 4,
                        right: 10,
                        fontSize: 10.5,
                        color: isMe ? "rgba(11,11,13,0.55)" : "#9A9AA2",
                        fontFamily: "JetBrains Mono,monospace",
                      }}
                    >
                      {time}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Composer */}
      <div
        style={{
          background: PAL.composerBg,
          borderTop: `1px solid ${PAL.composerBorder}`,
          padding: "14px 28px 16px",
          flexShrink: 0,
        }}
      >
        <div style={{ maxWidth: 820, margin: "0 auto", display: "flex", gap: 8, alignItems: "flex-end" }}>
          <div
            style={{
              flex: 1,
              background: PAL.composerInput,
              border: `1px solid ${PAL.composerBorder}`,
              borderRadius: 3,
              padding: "6px 8px 6px 12px",
              display: "flex",
              gap: 4,
              alignItems: "center",
              minHeight: 44,
            }}
          >
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={`Scrivi a ${peerName.split(" ")[0]}…`}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              style={{
                flex: 1,
                background: "transparent",
                outline: "none",
                fontSize: 14.5,
                padding: "0 8px",
                border: "none",
                color: "#0B0B0D",
              }}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!draft.trim() || sending}
            style={{
              width: 44,
              height: 44,
              borderRadius: 3,
              background: "#F2B744",
              color: "#0B0B0D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(242,183,68,0.35)",
              opacity: !draft.trim() || sending ? 0.4 : 1,
              cursor: !draft.trim() || sending ? "default" : "pointer",
            }}
          >
            <Icon name="send" size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
