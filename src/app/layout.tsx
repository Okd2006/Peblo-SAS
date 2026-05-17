import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AnimatedBackground } from "@/components/AnimatedBackground";

export const metadata: Metadata = {
  title: "Peblo Notes — AI-Powered Workspace",
  description: "A collaborative AI notes workspace. Write, organize, and understand your notes with AI.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AnimatedBackground />
          {children}
        </ThemeProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--text-primary)",
              border: "1px solid var(--border)",
              fontFamily: "Inter, sans-serif",
              fontSize: "13px",
              borderRadius: "10px",
              boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            },
            success: { iconTheme: { primary: "#7C3AED", secondary: "#fff" } },
          }}
        />
      </body>
    </html>
  );
}
