import { tool } from "@langchain/core/tools";
import { z } from "zod";

const COURSEWARE_SETTINGS = [
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

export const getCoursewareSettings = tool(
  async () => {
    return JSON.stringify(COURSEWARE_SETTINGS);
  },
  {
    name: "get_courseware_settings",
    description:
      "Retrieve all available courseware settings with their current values, recommended values, and available options.",
    schema: z.object({}),
  }
);

export const updateCoursewareSetting = tool(
  async ({
    settingId,
    newValue,
  }: {
    settingId: string;
    newValue: string;
  }) => {
    const setting = COURSEWARE_SETTINGS.find((s) => s.id === settingId);
    if (!setting) {
      return JSON.stringify({ success: false, error: "Setting not found" });
    }
    if (setting.options && !setting.options.includes(newValue)) {
      return JSON.stringify({
        success: false,
        error: `Invalid value. Options are: ${setting.options.join(", ")}`,
      });
    }
    const previousValue = setting.currentValue;
    // Mock the update (in real app, this would call the courseware API)
    return JSON.stringify({
      success: true,
      settingId,
      settingName: setting.name,
      previousValue,
      newValue,
      message: `${setting.name} updated from "${previousValue}" to "${newValue}"`,
    });
  },
  {
    name: "update_courseware_setting",
    description:
      "Update a specific courseware setting to a new value. Returns confirmation of the change.",
    schema: z.object({
      settingId: z.string().describe("The ID of the setting to update"),
      newValue: z.string().describe("The new value for the setting"),
    }),
  }
);
