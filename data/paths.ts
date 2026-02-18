/**
 * Static learning paths data for Phase 1.
 * Structure: Path → Levels (beginner only) → Sessions.
 */

export type SessionType = "reading" | "audio" | "practice" | "announcement";

export interface Session {
  id: string;
  title: string;
  type: SessionType;
  description?: string;
  order: number;
}

export interface Level {
  id: string;
  title: string;
  order: number;
  sessions: Session[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  introduction: string;
  levels: Level[];
}

export const learningPaths: LearningPath[] = [
  {
    id: "intro",
    title: "Introduction to the Path",
    description: "A gentle beginning for those new to guided spiritual learning.",
    introduction:
      "This path offers a short, human-written introduction to guided spiritual learning. Take your time. There is no rush.",
    levels: [
      {
        id: "beginner",
        title: "Beginner",
        order: 1,
        sessions: [
          { id: "welcome", title: "Welcome", type: "reading", order: 1, description: "A brief welcome and orientation." },
          { id: "intention", title: "Setting Intention", type: "reading", order: 2, description: "Reflecting on intention." },
          { id: "first-practice", title: "First Practice", type: "practice", order: 3, description: "A simple first practice." },
        ],
      },
    ],
  },
  {
    id: "practice",
    title: "Daily Practice",
    description: "Short, human-led sessions for reflection and connection.",
    introduction:
      "Daily practice is kept simple and calm. Each session is short and focused—reading, reflection, or a gentle practice.",
    levels: [
      {
        id: "beginner",
        title: "Beginner",
        order: 1,
        sessions: [
          { id: "morning", title: "Morning Reflection", type: "reading", order: 1 },
          { id: "breath", title: "Breath Awareness", type: "practice", order: 2 },
          { id: "closing", title: "Closing", type: "reading", order: 3 },
        ],
      },
    ],
  },
];

export function getPathById(id: string): LearningPath | undefined {
  return learningPaths.find((p) => p.id === id);
}

export function getSession(pathId: string, sessionId: string): Session | undefined {
  const path = getPathById(pathId);
  if (!path) return undefined;
  for (const level of path.levels) {
    const session = level.sessions.find((s) => s.id === sessionId);
    if (session) return session;
  }
  return undefined;
}
