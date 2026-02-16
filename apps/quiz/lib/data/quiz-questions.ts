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
  {
    id: "teaching-energy",
    question: "When a student nails a tough concept, how do you react?",
    options: [
      {
        label: "Big energy — I want them to feel how exciting this is!",
        value: "high",
      },
      {
        label: "A genuine smile and a thoughtful acknowledgment — I let the moment land.",
        value: "calm",
      },
      {
        label: "I keep it real — quick props, then on to what's next.",
        value: "direct",
      },
    ],
  },
  {
    id: "communication-approach",
    question: "Your go-to way of helping a stuck student:",
    options: [
      {
        label: "Make it fun — reframe the problem, use humor, lighten the mood.",
        value: "playful",
      },
      {
        label: "Get personal — share your own experience, connect on a human level.",
        value: "personal",
      },
      {
        label: "Cut to it — identify the gap, give clear steps, trust them to execute.",
        value: "analytical",
      },
    ],
  },
];
