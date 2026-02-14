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
// Quiz Results
// ============================================================

export async function getResults(page = 0, pageSize = 20) {
  const supabase = createSupabaseServiceClient();

  const { count } = await supabase
    .from("quiz_results")
    .select("*", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("quiz_results")
    .select(
      `
      *,
      personas (name),
      characters (name)
    `
    )
    .order("created_at", { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw new Error(error.message);
  return { results: data ?? [], total: count ?? 0 };
}

export async function getResultStats() {
  const supabase = createSupabaseServiceClient();

  const { data, error } = await supabase
    .from("quiz_results")
    .select("persona_id");

  if (error) throw new Error(error.message);

  const total = data?.length ?? 0;
  const distribution: Record<string, number> = {};
  for (const row of data ?? []) {
    distribution[row.persona_id] = (distribution[row.persona_id] || 0) + 1;
  }

  return { total, distribution };
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
  }
) {
  const supabase = createSupabaseServiceClient();
  const { error } = await supabase
    .from("characters")
    .update(params)
    .eq("id", id);

  if (error) throw new Error(error.message);
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
