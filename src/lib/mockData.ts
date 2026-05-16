export const mockNotes = [
  {
    id: "1", title: "Q2 Product Roadmap", content: "<p>Key initiatives for Q2 include launching the AI summary feature, improving onboarding flow, and shipping mobile app beta.</p>",
    tags: ["product", "planning"], isArchived: false, isPublic: false, shareId: null,
    aiSummary: "Q2 roadmap covers AI features, onboarding improvements, and mobile beta launch.",
    actionItems: ["Launch AI summary", "Improve onboarding", "Ship mobile beta"],
    suggestedTitle: "Q2 Product Roadmap & Initiatives",
    updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "2", title: "Meeting Notes — Design Review", content: "<p>Discussed new component library, spacing system, and dark mode implementation. Team agreed on Inter font.</p>",
    tags: ["design", "meeting"], isArchived: false, isPublic: true, shareId: "share-abc123",
    aiSummary: "Design review covered component library, spacing, dark mode, and font selection.",
    actionItems: ["Finalize component library", "Document spacing system"],
    suggestedTitle: "Design System Review Notes",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "3", title: "Ideas for Side Project", content: "<p>Build a CLI tool for managing dotfiles. Could use Rust for performance. Sync via GitHub Gist.</p>",
    tags: ["ideas", "dev"], isArchived: false, isPublic: false, shareId: null,
    aiSummary: null, actionItems: [], suggestedTitle: null,
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "4", title: "Book Notes: Deep Work", content: "<p>Cal Newport argues that deep, focused work is increasingly rare and valuable. Schedule deep work blocks daily.</p>",
    tags: ["reading", "productivity"], isArchived: false, isPublic: false, shareId: null,
    aiSummary: "Deep Work emphasizes focused, distraction-free work as a competitive advantage.",
    actionItems: ["Block 2h daily for deep work", "Remove Slack from phone"],
    suggestedTitle: "Deep Work — Key Takeaways",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "5", title: "Sprint Planning — Week 20", content: "<p>Stories: user auth refactor (5pts), dashboard charts (3pts), AI integration (8pts). Total: 16pts.</p>",
    tags: ["work", "planning"], isArchived: false, isPublic: false, shareId: null,
    aiSummary: "Sprint 20 includes auth refactor, dashboard charts, and AI integration totaling 16 story points.",
    actionItems: ["Refactor auth module", "Build dashboard charts", "Integrate AI API"],
    suggestedTitle: "Sprint 20 Planning Notes",
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

export const mockTags = ["product", "design", "dev", "meeting", "ideas", "reading", "work", "planning", "productivity"];

export const mockWeeklyActivity = [
  { day: "Mon", notes: 2 }, { day: "Tue", notes: 5 }, { day: "Wed", notes: 3 },
  { day: "Thu", notes: 7 }, { day: "Fri", notes: 4 }, { day: "Sat", notes: 1 }, { day: "Sun", notes: 3 },
];

export const mockTagDistribution = [
  { name: "work", value: 8 }, { name: "design", value: 5 }, { name: "dev", value: 6 },
  { name: "ideas", value: 4 }, { name: "reading", value: 3 },
];
