import type { QuizQuestion } from "@/lib/types";

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "mastery-philosophy",
    question: "When a student scores 75% on an assessment, your gut reaction is closest to:",
    options: [
      {
        label: "They explored the material and that's a solid start — time to move on.",
        value: "70",
      },
      {
        label: "They're building a good foundation — let's keep growing from here.",
        value: "80",
      },
      {
        label: "They need to go deeper before they're ready for what's next.",
        value: "90",
      },
    ],
  },
  {
    id: "communication-tone",
    question: "When a student is struggling, you're more likely to say:",
    options: [
      {
        label: "\"I believe in you — let's figure this out together.\"",
        value: "coach",
      },
      {
        label: "\"Here's exactly what you need to focus on to improve.\"",
        value: "advisor",
      },
    ],
  },
  {
    id: "classroom-structure",
    question: "Your ideal classroom feels most like:",
    options: [
      {
        label: "An open workshop — students find their own path through the material.",
        value: "open",
      },
      {
        label: "A guided journey — I set the milestones, they set the pace.",
        value: "guided",
      },
      {
        label: "A well-run operation — clear expectations, visible progress for everyone.",
        value: "structured",
      },
    ],
  },
  {
    id: "automated-messaging",
    question: "When it comes to automated encouragement and nudges for students:",
    options: [
      {
        label: "Keep it minimal — I want them to develop independence.",
        value: "minimal",
      },
      {
        label: "Yes — celebrate their wins and offer help when they're stuck.",
        value: "full",
      },
    ],
  },
];
