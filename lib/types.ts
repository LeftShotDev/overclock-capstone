import { z } from "zod";

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      personaWeights: z.record(z.string(), z.number()),
    })
  ),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export const QuizAnswerSchema = z.object({
  questionId: z.string(),
  selectedValue: z.string(),
});
export type QuizAnswer = z.infer<typeof QuizAnswerSchema>;

export const TeachingPersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  traits: z.array(z.string()),
  communicationStyle: z.string(),
});
export type TeachingPersona = z.infer<typeof TeachingPersonaSchema>;

export const CoursewareSettingSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  currentValue: z.union([z.string(), z.boolean(), z.number()]),
  recommendedValue: z.union([z.string(), z.boolean(), z.number()]),
  options: z.array(z.string()).optional(),
});
export type CoursewareSetting = z.infer<typeof CoursewareSettingSchema>;

export interface QuizResult {
  topPersonaId: string;
  scores: Record<string, number>;
  ranking: string[];
}
