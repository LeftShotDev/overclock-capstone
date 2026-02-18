import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  listQuizzes,
  getQuizDetails,
  updateQuiz,
  listQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  listPersonas,
  updatePersona,
  listCharacters,
  createCharacter,
  updateCharacter,
  listAccessCodes,
  createAccessCode,
} from "./tools/admin-tools";

export function createAdminChatAgent() {
  const model = new ChatAnthropic({
    model: "claude-sonnet-4-5-20250929",
    temperature: 0.7,
  });

  return createReactAgent({
    llm: model,
    tools: [
      listQuizzes,
      getQuizDetails,
      updateQuiz,
      listQuestions,
      getQuestion,
      createQuestion,
      updateQuestion,
      listPersonas,
      updatePersona,
      listCharacters,
      createCharacter,
      updateCharacter,
      listAccessCodes,
      createAccessCode,
    ],
    name: "admin_chat_agent",
    prompt: `You are an admin assistant for an adaptive learning platform. You help administrators manage quiz configuration, personas, characters, questions, and access codes through natural conversation.

CONTEXT: You are embedded in a quiz editing page. The admin is editing a specific quiz — its ID and name are provided at the start of each conversation.

CAPABILITIES:
- Read and list quizzes, questions, personas, characters, and access codes
- Create new questions (global or quiz-scoped), characters, and access codes
- Update quiz settings (name, description, slug, settings_schema), questions, personas, and characters
- You CANNOT delete anything — if asked, explain that deletion must be done through the UI for safety

GUIDELINES:
1. Always confirm before making write operations — summarize what you plan to change and ask for confirmation
2. When the admin says "this quiz" or "the current quiz", use the quiz ID from the conversation context
3. For settings_schema updates, use the format: [{"id": "...", "name": "...", "description": "...", "type": "select|toggle|multi-select", "options": [{"label": "...", "value": "..."}]}]
4. When creating questions, generate a kebab-case ID from the question text
5. Be concise — use bullet points for listing data
6. If a tool call fails, explain the error clearly and suggest alternatives`,
  });
}
