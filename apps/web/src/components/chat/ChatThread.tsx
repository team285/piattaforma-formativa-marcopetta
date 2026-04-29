/**
 * ChatThread — componente riusabile per thread chat 1:1.
 *
 * Usato da student/Chat.tsx (peer = coach) e coach/Chat.tsx (peer = student).
 *
 * Features:
 *  - Carica messaggi via REST (withTimeout)
 *  - Subscribe Realtime su INSERT in chat_messages filtrato per thread_id
 *  - Composer (Enter per inviare)
 *  - Auto-scroll a bottom su nuovi messaggi
 *  - Style WhatsApp tema Marco Petta (paper/amber)
 */

import { useEffect, useRef, useState } from "react";
import { supabase, withTimeout } from "../../lib/supabase";
import { Avatar, Icon } from "../ui";

interface Message {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

interface ChatThreadProps {
  threadId: string;
  peerId: string;
  peerName: string;
  peerInitials: string;
  meId: string;
  onBack?: () => void; // mostra back button (mobile)
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

export function ChatThread({
  threadId,
  peerName,
  peerInitials,
  meId,
  onBack,
}: ChatThreadProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Load messaggi quando cambia threadId
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const load = async () => {
      const msgsRes = await withTimeout(
        supabase
          .from("chat_messages")
          .select("id,thread_id,sender_id,body,created_at")
          .eq("thread_id", threadId)
          .order("created_at"),
        5000,
        { data: [] as Message[], error: null },
        "thread.messages"
      );
      if (cancelled) return;
      setMessages((msgsRes.data as Message[]) ?? []);
      setLoading(false);

      // Mark messages as read (i messaggi del peer)
      const unreadIds = ((msgsRes.data as Message[]) ?? [])
        .filter((m) => m.sender_id !== meId)
        .map((m) => m.id);
      if (unreadIds.length > 0) {
        await supabase
          .from("chat_messages")
          .update({ read_at: new Date().toISOString() })
          .in("id", unreadIds)
          .is("read_at", null);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [threadId, meId]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`chat:${threadId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `thread_id=eq.${threadId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          setMessages((cur) => {
            // Skip duplicati (potremmo averlo già aggiunto otticamente dopo send)
            if (cur.some((m) => m.id === newMsg.id)) return cur;
            return [...cur, newMsg];
          });
          // Se il messaggio non è mio, mark as read
          if (newMsg.sender_id !== meId) {
            supabase
              .from("chat_messages")
              .update({ read_at: new Date().toISOString() })
              .eq("id", newMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, meId]);

  // Auto-scroll a bottom
  useEffect(() => {
    if (scrollerRef.current) {
      scrollerRef.current.scrollTop = scrollerRef.current.scrollHeight;
    }
  }, [messages.length]);

  const sendMessage = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    const { data, error } = await supabase
      .from("chat_messages")
      .insert({ thread_id: threadId, sender_id: meId, body: text })
      .select("id,thread_id,sender_id,body,created_at")
      .single();
    setSending(false);
    if (error) {
      console.warn("[chat] send error:", error);
      return;
    }
    if (data) {
      // Aggiunta ottimistica (la subscription potrebbe duplicare ma il check id la skip)
      setMessages((cur) => {
        if (cur.some((m) => m.id === (data as Message).id)) return cur;
        return [...cur, data as Message];
      });
      setDraft("");
    }
  };

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", minWidth: 0 }}>
      {/* Header */}
      <div
        style={{
          background: PAL.headerBg,
          borderBottom: `1px solid ${PAL.headerBorder}`,
          padding: "14px 20px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexShrink: 0,
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Torna a inbox"
            style={{
              width: 32,
              height: 32,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: PAL.subtext,
              flexShrink: 0,
              marginLeft: -4,
            }}
            className="hover:bg-sand"
          >
            <Icon name="chevronl" size={14} />
          </button>
        )}
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
            className="truncate"
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
            online · realtime
          </div>
        </div>
      </div>

      {/* Messaggi */}
      <div
        ref={scrollerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 20px 24px",
          display: "flex",
          flexDirection: "column",
          gap: 4,
          backgroundImage: PAL.wallpaper,
          backgroundSize: "18px 18px",
        }}
      >
        <div
          style={{
            maxWidth: 820,
            width: "100%",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            gap: 4,
          }}
        >
          {loading ? (
            <div
              style={{
                alignSelf: "center",
                color: PAL.subtext,
                fontSize: 12,
                marginTop: 40,
                fontFamily: "JetBrains Mono,monospace",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              Caricamento messaggi…
            </div>
          ) : messages.length === 0 ? (
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
              Inizia la conversazione con {peerName.split(" ")[0]}.
            </div>
          ) : (
            messages.map((m, i) => {
              const isMe = m.sender_id === meId;
              const prev = messages[i - 1];
              const grouped = prev && prev.sender_id === m.sender_id;
              const time = new Date(m.created_at).toLocaleTimeString("it-IT", {
                hour: "2-digit",
                minute: "2-digit",
              });
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
                      maxWidth: "72%",
                      background: isMe ? PAL.outBubble : PAL.inBubble,
                      color: isMe ? PAL.outText : PAL.inText,
                      borderRadius: 3,
                      borderTopLeftRadius: !isMe && !grouped ? 0 : 3,
                      borderTopRightRadius: isMe && !grouped ? 0 : 3,
                      padding: "8px 12px",
                      fontSize: 14.5,
                      lineHeight: 1.5,
                      position: "relative",
                      boxShadow: isMe
                        ? "0 2px 6px rgba(242,183,68,0.25)"
                        : "0 2px 6px rgba(11,11,13,0.18)",
                      minWidth: 80,
                    }}
                  >
                    <div style={{ paddingRight: 50, paddingBottom: 2, whiteSpace: "pre-wrap" }}>
                      {m.body}
                    </div>
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
          padding: "14px 20px 16px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            maxWidth: 820,
            margin: "0 auto",
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
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
