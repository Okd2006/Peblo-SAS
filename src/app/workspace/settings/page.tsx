"use client";
import TopNavbar from "@/components/TopNavbar";
import { useAuthStore } from "@/store/authStore";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Key, User, Palette, Bell } from "lucide-react";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border p-5" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
      <div className="mb-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{title}</h3>
        {description && <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{description}</p>}
      </div>
      <Separator className="mb-4" />
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2">
      <label className="text-sm" style={{ color: "var(--text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { user } = useAuthStore();

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <TopNavbar title="Settings" />
      <div className="flex-1 overflow-y-auto px-6 py-6 fade-up">
        <div className="max-w-2xl mx-auto space-y-4">

          <Section title="Profile" description="Your account information">
            <div className="flex items-center gap-4 mb-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className="text-base font-semibold"
                  style={{ background: "var(--accent-light)", color: "var(--accent)" }}>
                  {user?.name?.[0]?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{user?.name}</p>
                <p className="text-xs" style={{ color: "var(--text-secondary)" }}>{user?.email}</p>
              </div>
            </div>
            <Field label="Name">
              <input defaultValue={user?.name} className="px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", width: "200px", fontFamily: "Inter, sans-serif" }} />
            </Field>
            <Field label="Email">
              <input defaultValue={user?.email} className="px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", width: "200px", fontFamily: "Inter, sans-serif" }} />
            </Field>
          </Section>

          <Section title="API Keys" description="Connect AI providers">
            <Field label="Gemini API Key">
              <input type="password" placeholder="AIza••••••••••••••••••••"
                className="px-3 py-1.5 rounded-lg text-sm outline-none"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-primary)", width: "200px", fontFamily: "Inter, sans-serif" }} />
            </Field>
            <p className="text-xs mt-2" style={{ color: "var(--text-muted)" }}>
              Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer"
                className="underline underline-offset-2" style={{ color: "var(--accent)" }}>aistudio.google.com</a>
            </p>
          </Section>

          <Section title="Appearance" description="Customize your workspace">
            <Field label="Theme">
              <div className="flex gap-2">
                {["Light", "Dark", "System"].map(t => (
                  <button key={t} className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
                    style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}>
                    {t}
                  </button>
                ))}
              </div>
            </Field>
          </Section>

          <div className="flex justify-end pt-2">
            <button className="px-4 py-2 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ background: "var(--accent)" }}>
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
