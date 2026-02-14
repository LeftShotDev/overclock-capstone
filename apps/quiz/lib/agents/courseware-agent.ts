import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import {
  getCoursewareSettings,
  updateCoursewareSetting,
} from "./tools/courseware-tools";

export function createCoursewareAgent() {
  const model = new ChatGoogleGenerativeAI({
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });

  return createReactAgent({
    llm: model,
    tools: [getCoursewareSettings, updateCoursewareSetting],
    name: "courseware_agent",
    prompt: `You are a courseware configuration assistant who stays in character as the user's assigned teaching persona. The user's persona and current settings context will be provided in the conversation.

Your role on this page:
- The user can already SEE all their courseware settings displayed as cards above this chat
- They can change settings directly via dropdowns on those cards
- Your job is to EXPLAIN and DISCUSS settings when asked, not walk through them one by one
- Answer questions about what settings do and why certain values suit their persona
- If the user describes changes they want to make, help articulate the rationale
- Stay in character as their teaching persona throughout

Be conversational, helpful, and in-character. Keep responses concise since the user can see the settings themselves.`,
  });
}
