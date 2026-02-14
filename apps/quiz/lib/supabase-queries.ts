import { getSupabase } from "@/lib/supabase";
import { PERSONAS } from "@/lib/data/personas";
import { QUIZ_QUESTIONS } from "@/lib/data/quiz-questions";
import { CONSTRAINT_QUESTIONS } from "@/lib/data/constraint-questions";
import type { TeachingPersona, Character, QuizQuestion, ConstraintQuestion } from "@/lib/types";

export async function fetchPersonas(): Promise<Record<string, TeachingPersona>> {
  try {
    const supabase = getSupabase();
    if (!supabase) return PERSONAS;

    const { data, error } = await supabase
      .from("personas")
      .select("*")
      .order("id");

    if (error || !data?.length) return PERSONAS;

    const result: Record<string, TeachingPersona> = {};
    for (const row of data) {
      result[row.id] = {
        id: row.id,
        name: row.name,
        description: row.description,
        resultMessage: row.result_message,
        masteryThreshold: row.mastery_threshold,
        messagePersonality: row.message_personality,
        sendAutoMessages: row.send_auto_messages,
        enabledAutoMessages: row.enabled_auto_messages,
        showStudyPlanRollup: row.show_study_plan_rollup,
        gradedParticipationEnabled: row.graded_participation_enabled,
      };
    }
    return result;
  } catch {
    return PERSONAS;
  }
}

export async function fetchCharactersByPersona(personaId: string): Promise<Character[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("persona_id", personaId)
      .order("sort_order");

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      personaId: row.persona_id,
      name: row.name,
      work: row.work,
      tagline: row.tagline,
      description: row.description,
      voiceProfile: row.voice_profile,
      sortOrder: row.sort_order,
    }));
  } catch {
    return [];
  }
}

export async function fetchCharacterById(
  characterId: string
): Promise<Character | null> {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("characters")
      .select("*")
      .eq("id", characterId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      personaId: data.persona_id,
      name: data.name,
      work: data.work,
      tagline: data.tagline,
      description: data.description,
      voiceProfile: data.voice_profile,
      sortOrder: data.sort_order,
    };
  } catch {
    return null;
  }
}

export async function writeQuizResult(params: {
  personaId: string;
  characterId: string | null;
  appliedSettings: Record<string, unknown>;
  quizAnswers: unknown[];
  constraintAnswers: unknown[];
  syllabusData: unknown | null;
}): Promise<string | null> {
  try {
    const supabase = getSupabase();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("quiz_results")
      .insert({
        persona_id: params.personaId,
        character_id: params.characterId,
        applied_settings: params.appliedSettings,
        quiz_answers: params.quizAnswers,
        constraint_answers: params.constraintAnswers,
        syllabus_data: params.syllabusData,
      })
      .select("id")
      .single();

    if (error || !data) return null;
    return data.id;
  } catch {
    return null;
  }
}

export async function writeMessageTemplates(params: {
  quizResultId: string;
  characterId: string;
  templates: { templateType: string; variants: string[] }[];
}): Promise<void> {
  try {
    const supabase = getSupabase();
    if (!supabase) return;

    const rows = params.templates.map((t) => ({
      quiz_result_id: params.quizResultId,
      template_type: t.templateType,
      character_id: params.characterId,
      variants: t.variants,
    }));

    await supabase.from("message_templates").insert(rows);
  } catch {
    // Best-effort write
  }
}

export async function fetchQuizQuestions(): Promise<QuizQuestion[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return QUIZ_QUESTIONS;

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("question_type", "persona")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data?.length) return QUIZ_QUESTIONS;

    return data.map((row) => ({
      id: row.id,
      question: row.question,
      options: row.options as { label: string; value: string }[],
    }));
  } catch {
    return QUIZ_QUESTIONS;
  }
}

export async function fetchConstraintQuestions(): Promise<ConstraintQuestion[]> {
  try {
    const supabase = getSupabase();
    if (!supabase) return CONSTRAINT_QUESTIONS;

    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("question_type", "constraint")
      .eq("is_active", true)
      .order("sort_order");

    if (error || !data?.length) return CONSTRAINT_QUESTIONS;

    return data.map((row) => ({
      id: row.id,
      question: row.question,
      type: "constraint" as const,
      constraintKey: row.constraint_key ?? row.id,
      options: row.options as { label: string; value: string }[],
    }));
  } catch {
    return CONSTRAINT_QUESTIONS;
  }
}

export async function fetchActiveAccessCodes(): Promise<boolean> {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { count, error } = await supabase
      .from("access_codes")
      .select("*", { count: "exact", head: true })
      .eq("is_active", true);

    if (error) return false;
    return (count ?? 0) > 0;
  } catch {
    return false;
  }
}

export async function validateAccessCode(code: string): Promise<boolean> {
  try {
    const supabase = getSupabase();
    if (!supabase) return false;

    const { data, error } = await supabase
      .from("access_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .eq("is_active", true)
      .single();

    if (error || !data) return false;

    // Check expiry
    if (data.expires_at && new Date(data.expires_at) < new Date()) return false;

    // Check max uses
    if (data.max_uses !== null && data.use_count >= data.max_uses) return false;

    // Increment use count
    await supabase
      .from("access_codes")
      .update({ use_count: data.use_count + 1 })
      .eq("id", data.id);

    return true;
  } catch {
    return false;
  }
}
