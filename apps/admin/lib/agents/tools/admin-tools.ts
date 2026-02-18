import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { createSupabaseServiceClient } from "@/lib/supabase-server";

// ---------------------------------------------------------------------------
// Quizzes
// ---------------------------------------------------------------------------

export const listQuizzes = tool(
  async () => {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, name, slug, description, is_active")
      .order("created_at", { ascending: false });
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ quizzes: data });
  },
  {
    name: "list_quizzes",
    description: "List all quizzes with id, name, slug, description, and active status.",
    schema: z.object({}),
  }
);

export const getQuizDetails = tool(
  async ({ quizId }: { quizId: string }) => {
    const supabase = createSupabaseServiceClient();
    const { data: quiz, error } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", quizId)
      .single();
    if (error) return JSON.stringify({ error: error.message });

    const { count } = await supabase
      .from("quiz_questions")
      .select("*", { count: "exact", head: true })
      .eq("quiz_id", quizId);

    return JSON.stringify({ quiz, questionCount: count ?? 0 });
  },
  {
    name: "get_quiz_details",
    description: "Get full details for a specific quiz including its settings schema and question count.",
    schema: z.object({
      quizId: z.string().describe("The UUID of the quiz"),
    }),
  }
);

export const updateQuiz = tool(
  async ({ quizId, ...fields }: {
    quizId: string;
    name?: string;
    description?: string;
    slug?: string;
    settingsSchema?: string;
    isActive?: boolean;
  }) => {
    const supabase = createSupabaseServiceClient();
    const update: Record<string, unknown> = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.description !== undefined) update.description = fields.description;
    if (fields.slug !== undefined) update.slug = fields.slug;
    if (fields.isActive !== undefined) update.is_active = fields.isActive;
    if (fields.settingsSchema !== undefined) {
      try {
        update.settings_schema = JSON.parse(fields.settingsSchema);
      } catch {
        return JSON.stringify({ error: "Invalid settings_schema JSON" });
      }
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("quizzes")
      .update(update)
      .eq("id", quizId)
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, quiz: data });
  },
  {
    name: "update_quiz",
    description: "Update a quiz's name, description, slug, settings_schema, or is_active status.",
    schema: z.object({
      quizId: z.string().describe("The UUID of the quiz to update"),
      name: z.string().optional().describe("New quiz name"),
      description: z.string().optional().describe("New quiz description"),
      slug: z.string().optional().describe("New quiz slug (must be unique)"),
      settingsSchema: z.string().optional().describe("JSON string of the settings schema array: [{id, name, description, type, options: [{label, value}]}]"),
      isActive: z.boolean().optional().describe("Whether the quiz is active"),
    }),
  }
);

// ---------------------------------------------------------------------------
// Questions
// ---------------------------------------------------------------------------

export const listQuestions = tool(
  async ({ quizId }: { quizId?: string }) => {
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("quiz_questions")
      .select("id, question, question_type, options, sort_order, is_active, is_draft, quiz_id")
      .order("sort_order", { ascending: true });

    if (quizId) {
      query = query.eq("quiz_id", quizId);
    } else {
      query = query.is("quiz_id", null);
    }

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ questions: data });
  },
  {
    name: "list_questions",
    description: "List quiz questions. If quizId is provided, returns questions scoped to that quiz. Otherwise returns global questions (no quiz_id).",
    schema: z.object({
      quizId: z.string().optional().describe("Optional quiz UUID to filter by. Omit for global questions."),
    }),
  }
);

export const getQuestion = tool(
  async ({ questionId }: { questionId: string }) => {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("id", questionId)
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ question: data });
  },
  {
    name: "get_question",
    description: "Get full details for a specific question by its ID.",
    schema: z.object({
      questionId: z.string().describe("The question ID"),
    }),
  }
);

export const createQuestion = tool(
  async ({ id, question, questionType, options, sortOrder, quizId, isDraft }: {
    id: string;
    question: string;
    questionType: string;
    options: string;
    sortOrder: number;
    quizId?: string;
    isDraft?: boolean;
  }) => {
    const supabase = createSupabaseServiceClient();
    let parsedOptions;
    try {
      parsedOptions = JSON.parse(options);
    } catch {
      return JSON.stringify({ error: "Invalid options JSON" });
    }

    const { data, error } = await supabase
      .from("quiz_questions")
      .insert({
        id,
        question,
        question_type: questionType,
        options: parsedOptions,
        sort_order: sortOrder,
        quiz_id: quizId ?? null,
        is_draft: isDraft ?? false,
        is_active: true,
      })
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, question: data });
  },
  {
    name: "create_question",
    description: "Create a new quiz question.",
    schema: z.object({
      id: z.string().describe("Kebab-case question ID (e.g. 'mastery-level')"),
      question: z.string().describe("The question text"),
      questionType: z.enum(["persona", "constraint"]).describe("Question type"),
      options: z.string().describe('JSON string of options array: [{"label": "...", "value": "..."}]'),
      sortOrder: z.number().describe("Display order (0-based)"),
      quizId: z.string().optional().describe("Quiz UUID to scope this question to. Omit for global."),
      isDraft: z.boolean().optional().describe("Whether this is a draft question (default false)"),
    }),
  }
);

export const updateQuestion = tool(
  async ({ questionId, ...fields }: {
    questionId: string;
    question?: string;
    questionType?: string;
    options?: string;
    sortOrder?: number;
    isActive?: boolean;
  }) => {
    const supabase = createSupabaseServiceClient();
    const update: Record<string, unknown> = {};
    if (fields.question !== undefined) update.question = fields.question;
    if (fields.questionType !== undefined) update.question_type = fields.questionType;
    if (fields.sortOrder !== undefined) update.sort_order = fields.sortOrder;
    if (fields.isActive !== undefined) update.is_active = fields.isActive;
    if (fields.options !== undefined) {
      try {
        update.options = JSON.parse(fields.options);
      } catch {
        return JSON.stringify({ error: "Invalid options JSON" });
      }
    }
    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("quiz_questions")
      .update(update)
      .eq("id", questionId)
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, question: data });
  },
  {
    name: "update_question",
    description: "Update a question's text, type, options, sort order, or active status.",
    schema: z.object({
      questionId: z.string().describe("The question ID to update"),
      question: z.string().optional().describe("New question text"),
      questionType: z.enum(["persona", "constraint"]).optional().describe("New question type"),
      options: z.string().optional().describe('JSON string of options array: [{"label": "...", "value": "..."}]'),
      sortOrder: z.number().optional().describe("New display order"),
      isActive: z.boolean().optional().describe("Whether the question is active"),
    }),
  }
);

// ---------------------------------------------------------------------------
// Personas
// ---------------------------------------------------------------------------

export const listPersonas = tool(
  async () => {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("personas")
      .select("id, name, description, mastery_threshold, message_personality, send_auto_messages, enabled_auto_messages, show_study_plan_rollup, graded_participation_enabled");
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ personas: data });
  },
  {
    name: "list_personas",
    description: "List all teaching personas with their settings (mastery threshold, message personality, auto messages, etc.).",
    schema: z.object({}),
  }
);

export const updatePersona = tool(
  async ({ personaId, ...fields }: {
    personaId: string;
    name?: string;
    description?: string;
    resultMessage?: string;
    masteryThreshold?: number;
    messagePersonality?: string;
    sendAutoMessages?: boolean;
    enabledAutoMessages?: string[];
    showStudyPlanRollup?: boolean;
    gradedParticipationEnabled?: boolean;
  }) => {
    const supabase = createSupabaseServiceClient();
    const update: Record<string, unknown> = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.description !== undefined) update.description = fields.description;
    if (fields.resultMessage !== undefined) update.result_message = fields.resultMessage;
    if (fields.masteryThreshold !== undefined) update.mastery_threshold = fields.masteryThreshold;
    if (fields.messagePersonality !== undefined) update.message_personality = fields.messagePersonality;
    if (fields.sendAutoMessages !== undefined) update.send_auto_messages = fields.sendAutoMessages;
    if (fields.enabledAutoMessages !== undefined) update.enabled_auto_messages = fields.enabledAutoMessages;
    if (fields.showStudyPlanRollup !== undefined) update.show_study_plan_rollup = fields.showStudyPlanRollup;
    if (fields.gradedParticipationEnabled !== undefined) update.graded_participation_enabled = fields.gradedParticipationEnabled;

    const { data, error } = await supabase
      .from("personas")
      .update(update)
      .eq("id", personaId)
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, persona: data });
  },
  {
    name: "update_persona",
    description: "Update a persona's settings such as name, description, mastery threshold, message personality, auto messages, study plan rollup, or graded participation.",
    schema: z.object({
      personaId: z.string().describe("The persona ID (e.g. 'explorer', 'mastery_coach')"),
      name: z.string().optional().describe("New persona name"),
      description: z.string().optional().describe("New persona description"),
      resultMessage: z.string().optional().describe("New result message shown after quiz"),
      masteryThreshold: z.number().optional().describe("Mastery threshold percentage (70, 80, or 90)"),
      messagePersonality: z.string().optional().describe("Message personality ('coach' or 'advisor')"),
      sendAutoMessages: z.boolean().optional().describe("Whether auto messages are enabled"),
      enabledAutoMessages: z.array(z.string()).optional().describe("Which auto messages are enabled (e.g. ['help_hints', 'good_game'])"),
      showStudyPlanRollup: z.boolean().optional().describe("Whether study plan rollup is shown"),
      gradedParticipationEnabled: z.boolean().optional().describe("Whether graded participation is enabled"),
    }),
  }
);

// ---------------------------------------------------------------------------
// Characters
// ---------------------------------------------------------------------------

export const listCharacters = tool(
  async ({ personaId }: { personaId?: string }) => {
    const supabase = createSupabaseServiceClient();
    let query = supabase
      .from("characters")
      .select("id, name, work, tagline, persona_id, sex, ethnicity, image_url, sort_order")
      .order("sort_order", { ascending: true });

    if (personaId) {
      query = query.eq("persona_id", personaId);
    }

    const { data, error } = await query;
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ characters: data });
  },
  {
    name: "list_characters",
    description: "List characters, optionally filtered by persona ID.",
    schema: z.object({
      personaId: z.string().optional().describe("Optional persona ID to filter by (e.g. 'mastery_coach')"),
    }),
  }
);

export const createCharacter = tool(
  async ({ id, personaId, name, work, tagline, description, voiceProfile, sortOrder, sex, ethnicity }: {
    id: string;
    personaId: string;
    name: string;
    work: string;
    tagline: string;
    description: string;
    voiceProfile: string;
    sortOrder: number;
    sex?: string;
    ethnicity?: string;
  }) => {
    const supabase = createSupabaseServiceClient();
    let parsedProfile;
    try {
      parsedProfile = JSON.parse(voiceProfile);
    } catch {
      return JSON.stringify({ error: "Invalid voiceProfile JSON" });
    }

    const { data, error } = await supabase
      .from("characters")
      .insert({
        id,
        persona_id: personaId,
        name,
        work,
        tagline,
        description,
        voice_profile: parsedProfile,
        sort_order: sortOrder,
        sex: sex ?? null,
        ethnicity: ethnicity ?? null,
      })
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, character: data });
  },
  {
    name: "create_character",
    description: "Create a new character under a persona.",
    schema: z.object({
      id: z.string().describe("Snake_case character ID (e.g. 'coach_carter')"),
      personaId: z.string().describe("Persona ID this character belongs to"),
      name: z.string().describe("Character name"),
      work: z.string().describe("The franchise/work the character is from"),
      tagline: z.string().describe("Short character motto or quote"),
      description: z.string().describe("2-sentence teaching energy summary"),
      voiceProfile: z.string().describe("JSON string of voice profile object with tone, sentence_style, vocabulary, signature_moves, avoids, example_voice"),
      sortOrder: z.number().describe("Display order within the persona"),
      sex: z.string().optional().describe("Male or Female"),
      ethnicity: z.string().optional().describe("White, Black, Latino, or Asian"),
    }),
  }
);

export const updateCharacter = tool(
  async ({ characterId, ...fields }: {
    characterId: string;
    name?: string;
    work?: string;
    tagline?: string;
    description?: string;
    voiceProfile?: string;
    sortOrder?: number;
    sex?: string;
    ethnicity?: string;
  }) => {
    const supabase = createSupabaseServiceClient();
    const update: Record<string, unknown> = {};
    if (fields.name !== undefined) update.name = fields.name;
    if (fields.work !== undefined) update.work = fields.work;
    if (fields.tagline !== undefined) update.tagline = fields.tagline;
    if (fields.description !== undefined) update.description = fields.description;
    if (fields.sortOrder !== undefined) update.sort_order = fields.sortOrder;
    if (fields.sex !== undefined) update.sex = fields.sex;
    if (fields.ethnicity !== undefined) update.ethnicity = fields.ethnicity;
    if (fields.voiceProfile !== undefined) {
      try {
        update.voice_profile = JSON.parse(fields.voiceProfile);
      } catch {
        return JSON.stringify({ error: "Invalid voiceProfile JSON" });
      }
    }

    const { data, error } = await supabase
      .from("characters")
      .update(update)
      .eq("id", characterId)
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, character: data });
  },
  {
    name: "update_character",
    description: "Update a character's name, work, tagline, description, voice profile, sort order, sex, or ethnicity.",
    schema: z.object({
      characterId: z.string().describe("The character ID to update"),
      name: z.string().optional().describe("New character name"),
      work: z.string().optional().describe("New franchise/work"),
      tagline: z.string().optional().describe("New tagline/motto"),
      description: z.string().optional().describe("New description"),
      voiceProfile: z.string().optional().describe("JSON string of new voice profile object"),
      sortOrder: z.number().optional().describe("New display order"),
      sex: z.string().optional().describe("Male or Female"),
      ethnicity: z.string().optional().describe("White, Black, Latino, or Asian"),
    }),
  }
);

// ---------------------------------------------------------------------------
// Access Codes
// ---------------------------------------------------------------------------

export const listAccessCodes = tool(
  async () => {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("access_codes")
      .select("id, code, label, is_active, max_uses, use_count, expires_at, created_at")
      .order("created_at", { ascending: false });
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ accessCodes: data });
  },
  {
    name: "list_access_codes",
    description: "List all access codes with their status, usage, and expiration.",
    schema: z.object({}),
  }
);

export const createAccessCode = tool(
  async ({ code, label, maxUses, expiresAt }: {
    code: string;
    label?: string;
    maxUses?: number;
    expiresAt?: string;
  }) => {
    const supabase = createSupabaseServiceClient();
    const { data, error } = await supabase
      .from("access_codes")
      .insert({
        code,
        label: label ?? null,
        is_active: true,
        max_uses: maxUses ?? null,
        use_count: 0,
        expires_at: expiresAt ?? null,
      })
      .select()
      .single();
    if (error) return JSON.stringify({ error: error.message });
    return JSON.stringify({ success: true, accessCode: data });
  },
  {
    name: "create_access_code",
    description: "Create a new access code for gating quiz entry.",
    schema: z.object({
      code: z.string().describe("The access code string (e.g. 'SPRING2026')"),
      label: z.string().optional().describe("Human-readable label (e.g. 'Spring 2026 Demo')"),
      maxUses: z.number().optional().describe("Maximum number of uses (omit for unlimited)"),
      expiresAt: z.string().optional().describe("ISO 8601 expiration date (omit for no expiry)"),
    }),
  }
);
