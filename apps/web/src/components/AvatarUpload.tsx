/**
 * AvatarUpload — picker file immagine + upload al bucket avatars (pubblico).
 *
 * Path: avatars/{user_id}/avatar.{ext}
 * Su upload: salva avatar_url su profiles + refresh.
 *
 * RLS già configurato (avatars write own).
 */

import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../lib/auth";
import { Avatar, Icon, toast } from "./ui";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE = 4 * 1024 * 1024; // 4 MB

interface Props {
  size?: number;
  /** URL avatar attuale (se profile.avatar_url esiste) */
  currentUrl?: string | null;
  initials: string;
  tone?: "ink" | "ember" | "sand";
}

export function AvatarUpload({ size = 80, currentUrl, initials, tone = "ember" }: Props) {
  const { profile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sincronizza localUrl quando currentUrl cambia (es. profile arriva dopo, o cambio via altra tab)
  useEffect(() => {
    setLocalUrl(currentUrl ?? null);
  }, [currentUrl]);

  const upload = async (file: File) => {
    if (!profile?.id) return;
    if (!ACCEPTED.includes(file.type)) {
      toast("Formato non supportato. Usa jpg, png o webp.", "warn");
      return;
    }
    if (file.size > MAX_SIZE) {
      toast("Immagine troppo grande (max 4 MB).", "warn");
      return;
    }
    setUploading(true);
    const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
    const path = `${profile.id}/avatar.${ext}`;

    // Pulisci file vecchi nello stesso folder dell'utente per evitare orfani
    // (es. avatar.jpg vecchio quando si carica avatar.png nuovo).
    const listRes = await supabase.storage.from("avatars").list(profile.id);
    if (!listRes.error && listRes.data && listRes.data.length > 0) {
      const oldPaths = listRes.data
        .map((f) => `${profile.id}/${f.name}`)
        .filter((p) => p !== path);
      if (oldPaths.length > 0) {
        await supabase.storage.from("avatars").remove(oldPaths);
      }
    }

    // Upload con upsert (sostituisce se esiste già)
    const upRes = await supabase.storage
      .from("avatars")
      .upload(path, file, { contentType: file.type, upsert: true });
    if (upRes.error) {
      toast(`Upload fallito: ${upRes.error.message}`, "warn");
      setUploading(false);
      return;
    }

    // Recupera URL pubblico
    const pubUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
    // Aggiungo cache buster per forzare il refresh dell'immagine
    const urlWithBuster = `${pubUrl}?v=${Date.now()}`;

    // Salva su profiles.avatar_url (se la colonna esiste — fallback no-op)
    const updRes = await supabase
      .from("profiles")
      .update({ avatar_url: urlWithBuster })
      .eq("id", profile.id);
    if (updRes.error) {
      // Probabile: colonna avatar_url non esiste. Non blocchiamo: mostriamo locale.
      console.warn("[avatar] profiles.avatar_url update skipped:", updRes.error.message);
    }

    setLocalUrl(urlWithBuster);
    setUploading(false);
    toast("Avatar aggiornato", "ok");
    await refreshProfile();
  };

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) upload(file);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="relative inline-block">
      {localUrl ? (
        <img
          src={localUrl}
          alt="Avatar"
          width={size}
          height={size}
          className="rounded-full object-cover bg-paper-2 border border-line"
          style={{ width: size, height: size }}
        />
      ) : (
        <Avatar initials={initials} size={size} tone={tone} />
      )}

      <button
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        title="Cambia avatar"
        className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-ink text-paper border-2 border-paper flex items-center justify-center hover:bg-[var(--ember)] transition disabled:opacity-50"
      >
        {uploading ? (
          <span className="font-mono text-[9px]">…</span>
        ) : (
          <Icon name="upload" size={12} />
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onPick}
      />
    </div>
  );
}
