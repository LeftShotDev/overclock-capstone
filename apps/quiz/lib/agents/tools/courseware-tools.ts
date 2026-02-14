import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { COURSEWARE_SETTINGS } from "@/lib/data/courseware-settings";

export const getCoursewareSettings = tool(
  async () => {
    return JSON.stringify(
      COURSEWARE_SETTINGS.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        type: s.type,
        currentValue: s.currentValue,
        recommendedValue: s.recommendedValue,
        options: s.options,
      }))
    );
  },
  {
    name: "get_courseware_settings",
    description:
      "Retrieve all available courseware settings with their current values, recommended values, types (toggle/select/multi-select), and available options.",
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

    // Validate based on setting type
    if (setting.type === "toggle") {
      if (newValue !== "true" && newValue !== "false") {
        return JSON.stringify({
          success: false,
          error: "Toggle settings accept 'true' or 'false'",
        });
      }
    } else if (setting.type === "select" && setting.options) {
      const validValues = setting.options.map((o) => String(o.value));
      if (!validValues.includes(newValue)) {
        return JSON.stringify({
          success: false,
          error: `Invalid value. Options are: ${validValues.join(", ")}`,
        });
      }
    }

    const previousValue = setting.currentValue;
    return JSON.stringify({
      success: true,
      settingId,
      settingName: setting.name,
      settingType: setting.type,
      previousValue,
      newValue,
      message: `${setting.name} updated from "${previousValue}" to "${newValue}"`,
    });
  },
  {
    name: "update_courseware_setting",
    description:
      "Update a specific courseware setting to a new value. For toggle settings use 'true'/'false'. For select settings use one of the valid option values. Returns confirmation of the change.",
    schema: z.object({
      settingId: z.string().describe("The ID of the setting to update"),
      newValue: z.string().describe("The new value for the setting (as a string)"),
    }),
  }
);
