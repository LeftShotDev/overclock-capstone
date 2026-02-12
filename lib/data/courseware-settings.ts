import type { CoursewareSetting } from "@/lib/types";

export const COURSEWARE_SETTINGS: CoursewareSetting[] = [
  {
    id: "due-dates",
    name: "Assignment Due Dates",
    description: "Controls whether assignment due dates are strictly enforced, flexible, or merely suggested.",
    currentValue: "strict",
    recommendedValue: "flexible",
    options: ["strict", "flexible", "suggested"],
  },
  {
    id: "grading-visibility",
    name: "Grade Visibility",
    description: "When students can see their grades after submission.",
    currentValue: "after-grading",
    recommendedValue: "immediate",
    options: ["immediate", "after-grading", "end-of-module"],
  },
  {
    id: "late-submission",
    name: "Late Submission Policy",
    description: "How late submissions are handled — penalty per day, grace period, or no late submissions.",
    currentValue: "no-late",
    recommendedValue: "grace-period",
    options: ["no-late", "penalty-per-day", "grace-period", "always-open"],
  },
  {
    id: "discussion-boards",
    name: "Discussion Board Settings",
    description: "Whether discussion boards require posts before viewing others, and if participation is graded.",
    currentValue: "post-first",
    recommendedValue: "open-view",
    options: ["post-first", "open-view", "graded-participation", "optional"],
  },
  {
    id: "content-release",
    name: "Content Release Schedule",
    description: "Whether all course content is available upfront or released on a weekly schedule.",
    currentValue: "weekly",
    recommendedValue: "all-at-once",
    options: ["all-at-once", "weekly", "prerequisite-based"],
  },
];
