"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui";
import { SITE_URL, isSupabaseConfigured } from "@/lib/supabase/env";

type Mode = "password" | "magic";

export default function LoginPage() {
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const [mode, setMode] = useState<Mode>("password");
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [sent, setSent] = useState<"magic" | "reset" | null>(null);
  const [busy, setBusy] = useState<null | "google" | "magic" | "password" | "reset">(null);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [next, setNext] = useState("/");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const e = p.get("error");
    if (e) {
      const reason = decodeURIComponent(e);
      setErr(reason === "auth" ? "No se pudo completar el inicio de sesión. Verifica la config de URLs en Supabase." : `No se pudo iniciar sesión: ${reason}`);
    }
    const n = p.get("next");
    if (n && n.startsWith("/")) setNext(n);
  }, []);

  const callbackUrl = () => `${SITE_URL}/auth/callback?next=${encodeURIComponent(next)}`;

  async function supabase() {
    const { getBrowserClient } = await import("@/lib/supabase/client");
    return getBrowserClient();
  }

  async function google() {
    try {
      setBusy("google");
      setErr(null);
      const sb = await supabase();
      const { error } = await sb.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl() },
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
      const sb = await supabase();
      const { error } = await sb.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: callbackUrl() },
      });
      if (error) throw error;
      setSent("magic");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al enviar el enlace");
    } finally {
      setBusy(null);
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      setBusy("reset");
      setErr(null);
      const sb = await supabase();
      const { error } = await sb.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: callbackUrl(),
      });
      if (error) throw error;
      setSent("reset");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al enviar el correo");
    } finally {
      setBusy(null);
    }
  }

  async function withPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password) return;
    try {
      setBusy("password");
      setErr(null);
      setInfo(null);
      const sb = await supabase();
      if (isSignup) {
        const { data, error } = await sb.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: callbackUrl() },
        });
        if (error) throw error;
        if (data.session) {
          router.push(next);
          router.refresh();
        } else {
          setInfo("Cuenta creada. Revisa tu correo para confirmarla (si no llega, intenta iniciar sesión directamente).");
          setIsSignup(false);
        }
      } else {
        const { error } = await sb.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        router.push(next);
        router.refresh();
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error de autenticación";
      if (msg.toLowerCase().includes("invalid login credentials") || msg.toLowerCase().includes("email not confirmed")) {
        setErr("Correo o contraseña incorrectos. Si aún no tienes contraseña, usa \"Olvidé mi contraseña\" para crear una.");
      } else {
        setErr(msg);
      }
    } finally {
      setBusy(null);
    }
  }

  if (sent) {
    const isReset = sent === "reset";
    return (
      <div className="scroll">
        <div className="safe-top" />
        <div className="pad col center" style={{ minHeight: "78%", justifyContent: "center", gap: 18, textAlign: "center", padding: "24px 26px" }}>
          <div className="card card-p col center gap8" style={{ width: "100%" }}>
            <Icon name="mail" size={30} color="var(--turq)" />
            <h3 style={{ fontSize: 18 }}>{isReset ? "Revisa tu correo 🔑" : "Revisa tu correo 📬"}</h3>
            <p className="muted" style={{ fontSize: 13 }}>
              {isReset
                ? <>Te enviamos un enlace para <b>crear una contraseña</b> a <b>{email}</b>. Ábrelo desde el mismo navegador.</>
                : <>Te enviamos un <b>enlace mágico</b> a <b>{email}</b>. Ábrelo desde el mismo navegador.</>}
            </p>
            <button className="btn btn-ghost btn-sm" onClick={() => setSent(null)}>Volver</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="scroll">
      <div className="safe-top" />
      <div className="pad col center" style={{ minHeight: "78%", justifyContent: "center", gap: 18, textAlign: "center", padding: "24px 26px" }}>
        <div className="floaty" style={{ width: 84, height: 84, borderRadius: 24, background: "linear-gradient(135deg, var(--turq), var(--turq-deep))", boxShadow: "var(--sh-turq)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42 }}>
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
            <button className="btn btn-coral btn-block" onClick={() => router.push("/")}>Entrar a la demo 🌴</button>
            <p className="muted" style={{ fontSize: 12 }}>Modo demo · sin cuenta. Conecta Supabase para guardar de verdad.</p>
          </div>
        ) : (
          <div className="col gap12" style={{ width: "100%" }}>
            <button className="btn btn-ghost btn-block" onClick={google} disabled={busy !== null}>
              <GoogleMark /> {busy === "google" ? "Conectando…" : "Continuar con Google"}
            </button>

            <div className="row center gap10" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
              <span style={{ flex: 1, height: 1, background: "var(--line)" }} /> o <span style={{ flex: 1, height: 1, background: "var(--line)" }} />
            </div>

            <div className="seg">
              <button className={mode === "password" ? "on" : ""} onClick={() => { setMode("password"); setErr(null); setInfo(null); }}>Contraseña</button>
              <button className={mode === "magic" ? "on" : ""} onClick={() => { setMode("magic"); setErr(null); setInfo(null); }}>Enlace mágico</button>
            </div>

            {mode === "magic" ? (
              <form className="col gap10" onSubmit={magic}>
                <input className="input" type="email" inputMode="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <button className="btn btn-turq btn-block" type="submit" disabled={busy !== null || !email.trim()}>
                  {busy === "magic" ? "Enviando…" : "Enviar enlace mágico"}
                </button>
              </form>
            ) : (
              <form className="col gap10" onSubmit={withPassword}>
                <input className="input" type="email" inputMode="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="input" type="password" placeholder="Contraseña (mín. 6 caracteres)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                <button className="btn btn-turq btn-block" type="submit" disabled={busy !== null || !email.trim() || !password}>
                  {busy === "password" ? "…" : isSignup ? "Crear cuenta" : "Entrar"}
                </button>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <button type="button" className="muted" style={{ background: "none", border: 0, fontSize: 12.5, cursor: "pointer" }} onClick={() => { setIsSignup(!isSignup); setErr(null); setInfo(null); }}>
                    {isSignup ? "¿Ya tienes cuenta?" : "¿Cuenta nueva?"}
                  </button>
                  {!isSignup && (
                    <button type="button" className="muted" style={{ background: "none", border: 0, fontSize: 12.5, cursor: "pointer" }}
                      onClick={(ev) => { ev.preventDefault(); if (email.trim()) resetPassword(ev as unknown as React.FormEvent); else setErr("Escribe tu correo arriba y luego pulsa este enlace."); }}>
                      Olvidé mi contraseña
                    </button>
                  )}
                </div>
              </form>
            )}

            {info && <p style={{ color: "var(--turq-deep)", fontSize: 12.5 }}>{info}</p>}
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
