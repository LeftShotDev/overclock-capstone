import type { QuizQuestion } from "@/lib/types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "q1",
    question: "How do you prefer to start a new course module?",
    options: [
      {
        label: "Dive straight into the material",
        value: "a",
        personaWeights: { "the-architect": 2, "the-coach": 0, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Provide a roadmap and overview first",
        value: "b",
        personaWeights: { "the-architect": 3, "the-coach": 1, "the-explorer": 0, "the-sage": 2 },
      },
      {
        label: "Start with a fun icebreaker activity",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 2, "the-sage": 0 },
      },
      {
        label: "Share a real-world case study",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 1, "the-explorer": 3, "the-sage": 2 },
      },
    ],
  },
  {
    id: "q2",
    question: "A student is struggling with the material. What's your first instinct?",
    options: [
      {
        label: "Break it down into smaller, structured steps",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 1, "the-explorer": 0, "the-sage": 2 },
      },
      {
        label: "Schedule a one-on-one to understand their situation",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Suggest they try a different approach or project",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 1, "the-explorer": 3, "the-sage": 1 },
      },
      {
        label: "Point them to additional readings and resources",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 0, "the-explorer": 1, "the-sage": 3 },
      },
    ],
  },
  {
    id: "q3",
    question: "What's your ideal classroom vibe?",
    options: [
      {
        label: "Organized and efficient — every minute counts",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 0, "the-explorer": 0, "the-sage": 2 },
      },
      {
        label: "Warm and supportive — a safe space to grow",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Dynamic and hands-on — learning by doing",
        value: "c",
        personaWeights: { "the-architect": 1, "the-coach": 1, "the-explorer": 3, "the-sage": 0 },
      },
      {
        label: "Intellectually stimulating — deep discussions welcome",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 0, "the-explorer": 1, "the-sage": 3 },
      },
    ],
  },
  {
    id: "q4",
    question: "How do you feel about due date flexibility?",
    options: [
      {
        label: "Deadlines are deadlines — consistency matters",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 0, "the-explorer": 0, "the-sage": 1 },
      },
      {
        label: "Case by case — life happens",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Flexible — the learning matters more than the timeline",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 1, "the-explorer": 3, "the-sage": 1 },
      },
      {
        label: "Structured but with built-in grace periods",
        value: "d",
        personaWeights: { "the-architect": 2, "the-coach": 1, "the-explorer": 0, "the-sage": 3 },
      },
    ],
  },
  {
    id: "q5",
    question: "Pick a motto that resonates with you:",
    options: [
      {
        label: "\"A place for everything and everything in its place\"",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 0, "the-explorer": 0, "the-sage": 1 },
      },
      {
        label: "\"I see you, I hear you, I'm here for you\"",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 0, "the-sage": 1 },
      },
      {
        label: "\"Let's try it and see what happens!\"",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 0, "the-explorer": 3, "the-sage": 1 },
      },
      {
        label: "\"Knowledge is the ultimate power\"",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 0, "the-explorer": 0, "the-sage": 3 },
      },
    ],
  },
];
