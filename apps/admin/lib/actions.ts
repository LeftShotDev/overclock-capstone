"use server";

import { createSupabaseServiceClient } from "./supabase-server";
import { revalidatePath } from "next/cache";

// ============================================================
// Quiz Questions
// ============================================================

export async function getQuestions() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .is("quiz_id", null)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getQuestion(id: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createQuestion(params: {
  id: string;
  question: string;
  question_type: string;
  constraint_key?: string;
  options: { label: string; value: string }[];
  sort_order: number;
}) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("quiz_questions").insert({
    id: params.id,
    question: params.question,
    question_type: params.question_type,
    constraint_key: params.constraint_key || null,
    options: params.options,
    sort_order: params.sort_order,
    is_active: true,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/questions");
}

export async function updateQuestion(
  id: string,
  params: {
    question?: string;
    question_type?: string;
    constraint_key?: string | null;
    options?: { label: string; value: string }[];
    sort_order?: number;
    is_active?: boolean;
  }
) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("quiz_questions")
    .update({ ...params, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/questions");
  revalidatePath(`/questions/${id}`);
}

export async function deleteQuestion(id: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/questions");
}

export async function reorderQuestions(
  updates: { id: string; sort_order: number }[]
) {
  const supabase = createSupabaseServiceClient();

  for (const u of updates) {
    const { error } = await supabase
      .from("quiz_questions")
      .update({ sort_order: u.sort_order })
      .eq("id", u.id);
    if (error) throw new Error(error.message);
  }

  revalidatePath("/questions");
}

// ============================================================
// Personas
// ============================================================

export async function getPersonas() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("personas")
    .select("*")
    .order("id");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function getPersona(id: string) {
  const supabase = createSupabaseServiceClient();

  const { data: persona, error: personaError } = await supabase
    .from("personas")
    .select("*")
    .eq("id", id)
    .single();

  if (personaError) throw new Error(personaError.message);

  const { data: characters, error: charError } = await supabase
    .from("characters")
    .select("*")
    .eq("persona_id", id)
    .order("sort_order");

  if (charError) throw new Error(charError.message);

  return { persona, characters: characters ?? [] };
}

export async function updatePersona(
  id: string,
  params: {
    name?: string;
    description?: string;
    result_message?: string;
    mastery_threshold?: number;
    message_personality?: string;
    send_auto_messages?: boolean;
    enabled_auto_messages?: string[];
    show_study_plan_rollup?: boolean;
    graded_participation_enabled?: boolean;
  }
) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("personas")
    .update(params)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/personas");
  revalidatePath(`/personas/${id}`);
}

export async function updateCharacter(
  id: string,
  params: {
    name?: string;
    work?: string;
    tagline?: string;
    description?: string;
    voice_profile?: Record<string, unknown>;
    sort_order?: number;
    sex?: string;
    ethnicity?: string;
  }
) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("characters")
    .update(params)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/personas");
  revalidatePath("/characters");
}

export async function getCharacters() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("characters")
    .select("*, personas(name)")
    .order("persona_id")
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createCharacter(params: {
  id: string;
  persona_id: string;
  name: string;
  work: string;
  tagline: string;
  description: string;
  voice_profile: Record<string, unknown>;
  sort_order: number;
  sex?: string;
  ethnicity?: string;
}) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("characters").insert(params);

  if (error) throw new Error(error.message);
  revalidatePath("/characters");
  revalidatePath("/personas");
}

export async function deleteCharacter(id: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("characters")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/characters");
  revalidatePath("/personas");
}

// ============================================================
// Access Codes
// ============================================================

export async function getAccessCodes() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("access_codes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createAccessCode(params: {
  code: string;
  label?: string;
  max_uses?: number | null;
  expires_at?: string | null;
}) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("access_codes").insert({
    code: params.code,
    label: params.label || null,
    max_uses: params.max_uses ?? null,
    expires_at: params.expires_at ?? null,
    is_active: true,
    use_count: 0,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/access-codes");
}

export async function updateAccessCode(
  id: string,
  params: {
    label?: string | null;
    is_active?: boolean;
    max_uses?: number | null;
    expires_at?: string | null;
  }
) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("access_codes")
    .update(params)
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/access-codes");
}

export async function deleteAccessCode(id: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("access_codes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/access-codes");
}

// ============================================================
// Quizzes
// ============================================================

export async function getQuizzes() {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("quizzes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  // Attach question counts per quiz
  const quizzes = (data ?? []) as { id: string; name: string; description: string | null; slug: string; settings_schema: unknown[]; is_active: boolean; created_at: string; updated_at: string }[];
  const quizIds = quizzes.map((q) => q.id);

  if (quizIds.length > 0) {
    const { data: questions } = await supabase
      .from("quiz_questions")
      .select("quiz_id, is_draft")
      .in("quiz_id", quizIds);

    const counts: Record<string, { total: number; drafts: number }> = {};
    for (const q of (questions ?? []) as { quiz_id: string | null; is_draft: boolean }[]) {
      if (!q.quiz_id) continue;
      if (!counts[q.quiz_id]) counts[q.quiz_id] = { total: 0, drafts: 0 };
      counts[q.quiz_id].total++;
      if (q.is_draft) counts[q.quiz_id].drafts++;
    }

    return quizzes.map((quiz) => ({
      ...quiz,
      question_count: counts[quiz.id]?.total ?? 0,
      draft_count: counts[quiz.id]?.drafts ?? 0,
    }));
  }

  return quizzes.map((quiz) => ({
    ...quiz,
    question_count: 0,
    draft_count: 0,
  }));
}

export async function getQuiz(id: string) {
  const supabase = createSupabaseServiceClient();
  const { data: quiz, error: quizError } = await supabase
    .from("quizzes")
    .select("*")
    .eq("id", id)
    .single();

  if (quizError) throw new Error(quizError.message);

  const { data: questions, error: qError } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", id)
    .order("sort_order");

  if (qError) throw new Error(qError.message);

  return { quiz, questions: questions ?? [] };
}

export async function createQuiz(params: {
  name: string;
  description?: string;
  slug: string;
  settings_schema?: { id: string; name: string; description: string; type: string; options: { label: string; value: string }[] }[];
}) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("quizzes")
    .insert({
      name: params.name,
      description: params.description || null,
      slug: params.slug,
      settings_schema: params.settings_schema ?? [],
      is_active: true,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  revalidatePath("/quizzes");
  return data;
}

export async function updateQuiz(
  id: string,
  params: {
    name?: string;
    description?: string | null;
    slug?: string;
    settings_schema?: { id: string; name: string; description: string; type: string; options: { label: string; value: string }[] }[];
    is_active?: boolean;
  }
) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("quizzes")
    .update({ ...params, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/quizzes");
  revalidatePath(`/quizzes/${id}`);
}

export async function deleteQuiz(id: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("quizzes")
    .delete()
    .eq("id", id);

  if (error) throw new Error(error.message);
  revalidatePath("/quizzes");
}

// Quiz-scoped questions
export async function getQuizQuestions(quizId: string) {
  const supabase = createSupabaseServiceClient();
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("quiz_id", quizId)
    .order("is_draft", { ascending: false })
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data ?? [];
}

export async function createQuizQuestion(params: {
  id: string;
  question: string;
  question_type: string;
  options: { label: string; value: string }[];
  sort_order: number;
  quiz_id: string;
  is_draft?: boolean;
}) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase.from("quiz_questions").insert({
    id: params.id,
    question: params.question,
    question_type: params.question_type,
    options: params.options,
    sort_order: params.sort_order,
    quiz_id: params.quiz_id,
    is_active: true,
    is_draft: params.is_draft ?? false,
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/quizzes/${params.quiz_id}/questions`);
}

export async function approveQuizQuestion(questionId: string, quizId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("quiz_questions")
    .update({ is_draft: false, updated_at: new Date().toISOString() })
    .eq("id", questionId);

  if (error) throw new Error(error.message);
  revalidatePath(`/quizzes/${quizId}/questions`);
}

export async function deleteQuizQuestion(questionId: string, quizId: string) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("quiz_questions")
    .delete()
    .eq("id", questionId);

  if (error) throw new Error(error.message);
  revalidatePath(`/quizzes/${quizId}/questions`);
}
