"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { SITE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState<null | "google" | "magic">(null);
  const [err, setErr] = useState<string | null>(null);

  async function google() {
    try {
      setBusy("google");
      setErr(null);
      const { getBrowserClient } = await import("@/lib/supabase/client");
      const { error } = await getBrowserClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${SITE_URL}/auth/callback` },
      });
      if (error) throw error;
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al iniciar con Google");
      setBusy(null);
    }
  }

  async function magic(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setBusy("magic");
      setErr(null);
      const { getBrowserClient } = await import("@/lib/supabase/client");
      const { error } = await getBrowserClient().auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: `${SITE_URL}/auth/callback` },
      });
      if (error) throw error;
      setSent(true);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al enviar el enlace");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col center" style={{ minHeight: "70%", justifyContent: "center", gap: 18, textAlign: "center", padding: "0 26px" }}>
        <div className="floaty" style={{ width: 88, height: 88, borderRadius: 26, background: "linear-gradient(135deg, var(--turq), var(--turq-deep))", boxShadow: "var(--sh-turq)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 44 }}>
          🌴
        </div>
        <div>
          <h1 className="display" style={{ fontSize: 38 }}>Viaja</h1>
          <p className="muted" style={{ fontSize: 15, marginTop: 6, lineHeight: 1.5 }}>
            Organiza viajes en grupo: presupuesto en vivo, votación de opciones e ideas en un solo lugar.
          </p>
        </div>

        {!configured ? (
          <div className="col gap10" style={{ width: "100%" }}>
            <button className="btn btn-coral btn-block" onClick={() => router.push("/")}>
              Entrar a la demo 🌴
            </button>
            <p className="muted" style={{ fontSize: 12 }}>Modo demo · sin cuenta. Conecta Supabase para guardar de verdad.</p>
          </div>
        ) : sent ? (
          <div className="card card-p col center gap8" style={{ width: "100%" }}>
            <Icon name="mail" size={30} color="var(--turq)" />
            <h3 style={{ fontSize: 18 }}>Revisa tu correo 📬</h3>
            <p className="muted" style={{ fontSize: 13 }}>Te enviamos un enlace mágico a <b>{email}</b>.</p>
            <button className="btn btn-ghost btn-sm" onClick={() => setSent(false)}>Usar otro correo</button>
          </div>
        ) : (
          <div className="col gap12" style={{ width: "100%" }}>
            <button className="btn btn-ghost btn-block" onClick={google} disabled={busy !== null}>
              <GoogleMark /> {busy === "google" ? "Conectando…" : "Continuar con Google"}
            </button>

            <div className="row center gap10" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
              <span style={{ flex: 1, height: 1, background: "var(--line)" }} /> o <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            </div>

            <form className="col gap10" onSubmit={magic}>
              <input className="input" type="email" inputMode="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button className="btn btn-turq btn-block" type="submit" disabled={busy !== null || !email.trim()}>
                {busy === "magic" ? "Enviando…" : "Enviar enlace mágico"}
              </button>
            </form>
            {err && <p style={{ color: "var(--coral-deep)", fontSize: 12.5 }}>{err}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8a12 12 0 110-24c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 1024 44c11 0 19.5-8 19.5-20 0-1.3-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8A12 12 0 0124 12c3 0 5.8 1.1 7.9 3l5.7-5.7A20 20 0 006.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2A12 12 0 0124 36c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3a12 12 0 01-4.1 5.6l6.2 5.2C41.4 35.8 44 30.4 44 24c0-1.3-.1-2.3-.4-3.5z" />
    </svg>
  );
}
