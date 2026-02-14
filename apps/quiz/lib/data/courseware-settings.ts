import type { CoursewareSetting } from "@/lib/types";

export const COURSEWARE_SETTINGS: CoursewareSetting[] = [
  {
    id: "mastery_threshold",
    name: "Mastery Threshold",
    description:
      "The minimum score a student needs to demonstrate mastery on an assessment.",
    currentValue: 80,
    recommendedValue: 80,
    type: "select",
    options: [
      { label: "70%", value: 70 },
      { label: "80%", value: 80 },
      { label: "90%", value: 90 },
    ],
  },
  {
    id: "message_personality",
    name: "Message Personality",
    description:
      "The tone of automated messages sent to students — coach (warm, encouraging) or advisor (direct, analytical).",
    currentValue: "coach",
    recommendedValue: "coach",
    type: "select",
    options: [
      { label: "Coach", value: "coach" },
      { label: "Advisor", value: "advisor" },
    ],
  },
  {
    id: "send_auto_messages",
    name: "Send Auto Messages",
    description:
      "Whether the platform sends automated messages to students based on their progress.",
    currentValue: true,
    recommendedValue: true,
    type: "toggle",
  },
  {
    id: "enabled_auto_messages",
    name: "Enabled Auto Messages",
    description:
      "Which types of automated messages are active — help hints (when struggling) and good game (when achieving mastery).",
    currentValue: ["help_hints"],
    recommendedValue: ["help_hints"],
    type: "multi-select",
    options: [
      { label: "Help Hints", value: "help_hints" },
      { label: "Good Game", value: "good_game" },
    ],
  },
  {
    id: "show_study_plan_rollup",
    name: "Show Study Plan Rollup",
    description:
      "Whether students see a summary of their progress across all modules in a study plan view.",
    currentValue: true,
    recommendedValue: true,
    type: "toggle",
  },
  {
    id: "graded_participation_enabled",
    name: "Graded Participation",
    description:
      "Whether student participation (discussion posts, activity completion) counts toward their grade.",
    currentValue: false,
    recommendedValue: false,
    type: "toggle",
  },
];
