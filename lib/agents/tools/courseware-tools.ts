import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { COURSEWARE_SETTINGS } from "@/lib/data/courseware-settings";

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
