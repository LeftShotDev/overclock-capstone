import { tool } from "@langchain/core/tools";
import { z } from "zod";

const QUIZ_QUESTIONS = [
  {
    id: "q1",
    question: "How do you prefer to start a new course module?",
    options: [
      {
        label: "Dive straight into the material",
        value: "a",
        personaWeights: { "the-architect": 2, "the-coach": 0, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Provide a roadmap and overview first",
        value: "b",
        personaWeights: { "the-architect": 3, "the-coach": 1, "the-explorer": 0, "the-sage": 2 },
      },
      {
        label: "Start with a fun icebreaker activity",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 2, "the-sage": 0 },
      },
      {
        label: "Share a real-world case study",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 1, "the-explorer": 3, "the-sage": 2 },
      },
    ],
  },
  {
    id: "q2",
    question: "A student is struggling with the material. What's your first instinct?",
    options: [
      {
        label: "Break it down into smaller, structured steps",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 1, "the-explorer": 0, "the-sage": 2 },
      },
      {
        label: "Schedule a one-on-one to understand their situation",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Suggest they try a different approach or project",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 1, "the-explorer": 3, "the-sage": 1 },
      },
      {
        label: "Point them to additional readings and resources",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 0, "the-explorer": 1, "the-sage": 3 },
      },
    ],
  },
  {
    id: "q3",
    question: "What's your ideal classroom vibe?",
    options: [
      {
        label: "Organized and efficient — every minute counts",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 0, "the-explorer": 0, "the-sage": 2 },
      },
      {
        label: "Warm and supportive — a safe space to grow",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Dynamic and hands-on — learning by doing",
        value: "c",
        personaWeights: { "the-architect": 1, "the-coach": 1, "the-explorer": 3, "the-sage": 0 },
      },
      {
        label: "Intellectually stimulating — deep discussions welcome",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 0, "the-explorer": 1, "the-sage": 3 },
      },
    ],
  },
  {
    id: "q4",
    question: "How do you feel about due date flexibility?",
    options: [
      {
        label: "Deadlines are deadlines — consistency matters",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 0, "the-explorer": 0, "the-sage": 1 },
      },
      {
        label: "Case by case — life happens",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 1, "the-sage": 1 },
      },
      {
        label: "Flexible — the learning matters more than the timeline",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 1, "the-explorer": 3, "the-sage": 1 },
      },
      {
        label: "Structured but with built-in grace periods",
        value: "d",
        personaWeights: { "the-architect": 2, "the-coach": 1, "the-explorer": 0, "the-sage": 3 },
      },
    ],
  },
  {
    id: "q5",
    question: "Pick a motto that resonates with you:",
    options: [
      {
        label: "\"A place for everything and everything in its place\"",
        value: "a",
        personaWeights: { "the-architect": 3, "the-coach": 0, "the-explorer": 0, "the-sage": 1 },
      },
      {
        label: "\"I see you, I hear you, I'm here for you\"",
        value: "b",
        personaWeights: { "the-architect": 0, "the-coach": 3, "the-explorer": 0, "the-sage": 1 },
      },
      {
        label: "\"Let's try it and see what happens!\"",
        value: "c",
        personaWeights: { "the-architect": 0, "the-coach": 0, "the-explorer": 3, "the-sage": 1 },
      },
      {
        label: "\"Knowledge is the ultimate power\"",
        value: "d",
        personaWeights: { "the-architect": 1, "the-coach": 0, "the-explorer": 0, "the-sage": 3 },
      },
    ],
  },
];

export const getNextQuestion = tool(
  async ({ currentIndex }: { currentIndex: number }) => {
    if (currentIndex >= QUIZ_QUESTIONS.length) {
      return JSON.stringify({
        complete: true,
        totalQuestions: QUIZ_QUESTIONS.length,
        message: "All questions have been answered! The quiz is complete.",
      });
    }
    const question = QUIZ_QUESTIONS[currentIndex];
    return JSON.stringify({
      complete: false,
      questionNumber: currentIndex + 1,
      totalQuestions: QUIZ_QUESTIONS.length,
      question,
    });
  },
  {
    name: "get_next_question",
    description:
      "Get the next quiz question by index. Returns the question with options, or indicates the quiz is complete.",
    schema: z.object({
      currentIndex: z
        .number()
        .describe("The zero-based index of the next question to retrieve"),
    }),
  }
);

export const submitAnswer = tool(
  async ({
    questionId,
    selectedValue,
  }: {
    questionId: string;
    selectedValue: string;
  }) => {
    const question = QUIZ_QUESTIONS.find((q) => q.id === questionId);
    if (!question) {
      return JSON.stringify({ recorded: false, error: "Question not found" });
    }
    const option = question.options.find((o) => o.value === selectedValue);
    if (!option) {
      return JSON.stringify({ recorded: false, error: "Invalid option" });
    }
    return JSON.stringify({
      recorded: true,
      questionId,
      selectedValue,
      personaWeights: option.personaWeights,
    });
  },
  {
    name: "submit_answer",
    description: "Record a user's answer for a quiz question and return the persona weights.",
    schema: z.object({
      questionId: z.string().describe("The ID of the question being answered"),
      selectedValue: z
        .string()
        .describe("The selected answer value (a, b, c, or d)"),
    }),
  }
);

export const getQuizResults = tool(
  async ({ answersJson }: { answersJson: string }) => {
    try {
      const answers: Array<{
        questionId: string;
        personaWeights: Record<string, number>;
      }> = JSON.parse(answersJson);

      const totals: Record<string, number> = {};
      for (const answer of answers) {
        for (const [persona, weight] of Object.entries(
          answer.personaWeights
        )) {
          totals[persona] = (totals[persona] || 0) + weight;
        }
      }

      const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a);
      const topPersonaId = sorted[0]?.[0] || "the-architect";

      return JSON.stringify({
        topPersonaId,
        scores: Object.fromEntries(sorted),
        ranking: sorted.map(([id]) => id),
      });
    } catch {
      return JSON.stringify({
        topPersonaId: "the-architect",
        scores: { "the-architect": 0 },
        ranking: ["the-architect"],
        error: "Failed to parse answers, defaulting to the-architect",
      });
    }
  },
  {
    name: "get_quiz_results",
    description:
      "Calculate quiz results from collected answers. Pass all answers with their persona weights as a JSON string. Returns the top persona and all scores.",
    schema: z.object({
      answersJson: z
        .string()
        .describe(
          "JSON string array of objects with questionId and personaWeights fields"
        ),
    }),
  }
);
