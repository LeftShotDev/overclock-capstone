import { z } from "zod";

export const QuizQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
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
  resultMessage: z.string(),
  masteryThreshold: z.number(),
  messagePersonality: z.enum(["coach", "advisor"]),
  sendAutoMessages: z.boolean(),
  enabledAutoMessages: z.array(z.string()),
  showStudyPlanRollup: z.boolean(),
  gradedParticipationEnabled: z.boolean(),
});
export type TeachingPersona = z.infer<typeof TeachingPersonaSchema>;

export const CharacterSchema = z.object({
  id: z.string(),
  personaId: z.string(),
  name: z.string(),
  work: z.string(),
  tagline: z.string(),
  description: z.string(),
  voiceProfile: z.record(z.string(), z.unknown()),
  sortOrder: z.number(),
});
export type Character = z.infer<typeof CharacterSchema>;

export const CoursewareSettingSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  currentValue: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]),
  recommendedValue: z.union([z.string(), z.boolean(), z.number(), z.array(z.string())]),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.union([z.string(), z.boolean(), z.number()]),
    })
  ).optional(),
  type: z.enum(["select", "toggle", "multi-select"]),
});
export type CoursewareSetting = z.infer<typeof CoursewareSettingSchema>;

export interface QuizResult {
  topPersonaId: string;
}

// Constraint questions — factual course logistics, no persona weights
export const ConstraintQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  type: z.literal("constraint"),
  constraintKey: z.string(),
  options: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
    })
  ),
});
export type ConstraintQuestion = z.infer<typeof ConstraintQuestionSchema>;

export const ConstraintAnswerSchema = z.object({
  constraintKey: z.string(),
  selectedValue: z.string(),
});
export type ConstraintAnswer = z.infer<typeof ConstraintAnswerSchema>;

// Syllabus extraction output
export const SyllabusDataSchema = z.object({
  courseDuration: z.string().optional(),
  assignmentTypes: z.array(z.string()).optional(),
  gradingPolicies: z.string().optional(),
  discussionExpectations: z.string().optional(),
  keyDates: z
    .array(z.object({ date: z.string(), description: z.string() }))
    .optional(),
  moduleCount: z.number().optional(),
  additionalNotes: z.string().optional(),
});
export type SyllabusData = z.infer<typeof SyllabusDataSchema>;

// Discriminated union for quiz step rendering
export type QuizStep =
  | { type: "persona"; question: QuizQuestion }
  | { type: "constraint"; question: ConstraintQuestion }
  | { type: "syllabus-upload" };

// Generated message templates
export const GeneratedTemplateSchema = z.object({
  templateType: z.string(),
  variants: z.array(z.string()),
});
export type GeneratedTemplate = z.infer<typeof GeneratedTemplateSchema>;

export const GeneratedTemplatesResultSchema = z.object({
  templates: z.array(GeneratedTemplateSchema),
  characterId: z.string(),
  personaId: z.string(),
  status: z.enum(["loading", "success", "error"]),
});
export type GeneratedTemplatesResult = z.infer<
  typeof GeneratedTemplatesResultSchema
>;
