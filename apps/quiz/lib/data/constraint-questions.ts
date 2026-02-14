import type { ConstraintQuestion } from "@/lib/types";

export const CONSTRAINT_QUESTIONS: ConstraintQuestion[] = [
  {
    id: "cq1",
    question: "When does your course start?",
    type: "constraint",
    constraintKey: "courseStartDate",
    options: [
      { label: "Within 2 weeks", value: "imminent" },
      { label: "1–2 months away", value: "soon" },
      { label: "3+ months away", value: "later" },
      { label: "It's already in progress", value: "ongoing" },
    ],
  },
  {
    id: "cq2",
    question: "How much time do you have to customize your courseware?",
    type: "constraint",
    constraintKey: "customizationTime",
    options: [
      { label: "Very little — just the essentials", value: "minimal" },
      { label: "A few hours to tweak things", value: "moderate" },
      { label: "Plenty of time to get it just right", value: "extensive" },
    ],
  },
];
