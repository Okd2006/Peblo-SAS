"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { api } from "@/lib/api";
import toast from "react-hot-toast";
import { Eye, EyeOff, Sparkles, FileText, Zap, Share2 } from "lucide-react";
import { PebloLogo } from "@/components/ui/PebloLogo";

const FEATURES = [
  { icon: Sparkles, text: "AI-powered summaries and action items" },
  { icon: FileText, text: "Rich notes with auto-save" },
  { icon: Zap, text: "Instant search and smart filters" },
  { icon: Share2, text: "One-click public sharing" },
];

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { user, token } = await api.auth.login(form);
      setAuth(user as Parameters<typeof setAuth>[0], token);
      toast.success("Welcome back!");
      router.push("/workspace");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Login failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      {/* Left hero */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-10 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #4C1D95 0%, #7C3AED 50%, #A78BFA 100%)" }}>
        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "28px 28px" }} />

        <div className="relative z-10">
          <PebloLogo size={36} className="[&_span]:text-white" showText />
        </div>

        <div className="relative z-10 space-y-6">
          <div>
            <h1 className="text-4xl font-semibold text-white leading-tight tracking-tight">
              Your AI-powered<br />notes workspace
            </h1>
            <p className="text-violet-200 mt-3 text-sm leading-relaxed">
              Write, organize, and understand your notes with the help of AI. Built for professionals and students.
            </p>
          </div>
          <div className="space-y-3">
            {FEATURES.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Icon size={13} className="text-white" />
                </div>
                <span className="text-sm text-violet-100">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-violet-300">
          Peblo — Friendly Innovation
        </p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="lg:hidden mb-8">
            <PebloLogo size={32} />
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Welcome back
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
              Sign in to your workspace
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Email address
              </label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", fontFamily: "Inter, sans-serif" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all"
                  style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-primary)", fontFamily: "Inter, sans-serif" }}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "var(--text-muted)" }}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold text-white transition-all hover:opacity-90 disabled:opacity-50 mt-2"
              style={{ background: "var(--accent)" }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </span>
              ) : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm mt-6" style={{ color: "var(--text-secondary)" }}>
            Don't have an account?{" "}
            <Link href="/signup" className="font-medium underline underline-offset-2 transition-colors hover:opacity-70"
              style={{ color: "var(--accent)" }}>
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
