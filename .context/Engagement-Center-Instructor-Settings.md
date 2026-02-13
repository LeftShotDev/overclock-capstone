# Engagement Center: Comprehensive Instructor Settings

This document lists all instructor-facing settings in the Faculty Engagement Center (EC) for use in designing an Agent-driven "personality" quiz and onboarding flow. Settings are grouped by where they live (course, teacher/enrollment, customization) and how they are exposed (Settings UI, API, defaults only).

---

## 1. Course-level settings (Course model `settings` / store_accessor)

These are stored on the **Course** record (JSON `settings` column) and apply to the whole course. The Engagement Center serializer exposes them via `EngagementCenter::CourseSerializer`; many are also writable via `Api::CoursesController#update` or dedicated endpoints.

| Setting | Type | Default | Where set in EC | API / Notes |
|--------|------|---------|-----------------|-------------|
| **mastery_threshold** | number (0–100) | 80 | Settings → Assessments → Mastery Threshold | `PUT /api/courses/:id` with `course: { mastery_threshold }`. Also creates a `CustomizationEvent` (set_mastery_threshold). |
| **send_auto_messages** | boolean | — | Implied by Message Assistant setup | Permitted in `update_params`; toggles whether automated messages are sent. |
| **message_personality** | string | `"coach"` | **Not currently in EC Settings UI** | One of `MessageTemplate::PERSONALITIES`: `"coach"` \| `"advisor"`. Validated on Course; affects default template tone (Coach vs Advisor). **Strong candidate for personality quiz.** |
| **enabled_auto_messages** | array of message types | `["help_hints", "good_game"]` | Settings → Automated Messages (checkboxes) | `PUT /api/courses/:id` with `course: { enabled_auto_messages: [] }`. Valid values: subset of `MessageTemplate::MESSAGE_TYPES`. |
| **dismissed_quick_setup** | boolean | false | Message Assistant setup ("Don't show me this again") | `PUT /api/courses/:id` with `course: { dismissed_quick_setup: true }`. Hides quick-setup onboarding. |
| **dismissed_getting_started** | boolean | false | — | Permitted in `update_params`; used for "getting started" dismissal state. |
| **show_research_consent** | boolean | true | — | Exposed in EC course payload; controls whether research consent is shown (e.g. to students). |
| **show_study_plan_rollup** | boolean | true | — | Permitted in `update_params`; affects study plan rollup visibility. |
| **expected_enrollments** | number | — | — | Permitted in `update_params`; optional planning/analytics. |
| **graded_participation_enabled** | boolean | — | — | Permitted in `update_params`; can be set from outcome’s `graded_participation_allowed` on course creation. |
| **feature_flags** | hash | — | — | Used via `course.feature_enabled?(feature)` / `set_feature!`; not currently in EC Settings UI. |
| **override_payment_type** | — | — | — | Payment override; not EC Settings. |
| **force_llas_for_course** | boolean | nil | — | LLAMA vs OEA assessment source; not in EC Settings. |
| **manually_cleared_messaging_teacher** | boolean | — | — | Set when instructor clears messaging teacher; not user-editable in UI. |

**Automated message types** (`MessageTemplate::MESSAGE_TYPES`):
`procrastinating_pupil`, `tardy_tester`, `help_hints`, `help_hints2`–`help_hints4`, `good_game`, `good_game2`–`good_game4`, `teacher_time`, `course_clues`, `alles_klar`.

EC Settings → Automated Messages currently only exposes **Study tips** (`help_hints`) and **Nice work!** (`good_game`) for enable/disable and edit.

---

## 2. Course-level (non-settings columns / customization)

| Setting | Type | Default | Where set in EC | API / Notes |
|--------|------|---------|-----------------|-------------|
| **messaging_teacher_enrollment_id** | integer (Enrollment id) | null | Message Assistant setup (Select instructor) | Set via `PUT /api/courses/:id/message_asst_setup` (message_asst_setup). Determines who sends automated messages. |
| **show_quiz_in_study_plans** | boolean | true | Settings → Assessments → Quiz Access | `PATCH /api/courses/:id/show_quiz_in_study_plans` with `course: { show_quiz_in_study_plans }`. May be overridden by customization events. |
| **dismissed_quick_setup** (column) | boolean | false | — | Also on Course as a column; serializer merges into `settings`. |

---

## 3. Teacher / user-level (per instructor, per course)

These apply to the **signed-in user** in the EC, often as **Teacher** (user + enrollment). Stored on **User** (`settings`) or **Enrollment** (`data`).

### 3.1 User (teacher) – `User.settings` and profile

| Setting | Type | Where set in EC | API / Notes |
|--------|------|-----------------|-------------|
| **first_name** | string | Settings → Communication Preferences | `PUT /api/courses/:id/users/:id` with `user: { first_name, ... }`. |
| **last_name** | string | Settings → Communication Preferences | Same. |
| **email** | string | Shown in Communication Preferences (read-only in UI) | — |
| **email_signature** | string | Settings → Communication Preferences; also Message Assistant setup | `user: { email_signature }`. Used in automated and intervention message footers. |
| **accepted_research_consent** | boolean | — | Permitted in `update_engagement_center` user params; not in EC Settings UI. |

### 3.2 Enrollment (teacher’s enrollment in the course) – `Enrollment.data`

| Setting | Type | Allowed values | Where set in EC | API / Notes |
|--------|------|----------------|-----------------|-------------|
| **notification_frequency** | string | `"never"` \| `"daily"` \| `"stream"` | Settings → Communication Preferences (Do not notify / Each time a recommendation is triggered) | `PUT .../users/:id` with `enrollment: { notification_frequency }`. `Enrollment::NOTIFICATION_FREQUENCIES`. |
| **course_goals** | array | e.g. `["fulfill-degree-requirement", "get-c"]` | — | Permitted in `update_engagement_center`; not in EC Settings UI. **Candidate for onboarding/quiz.** |
| **custom_course_goal** | string | — | — | Same. |
| **course_concerns** | string or null | — | — | Same. **Candidate for onboarding/quiz.** |

Other enrollment `data` fields (e.g. `has_visited_study_plan`, `has_sent_first_notification_email`, `opted_out`, `needs_trigger_checks`) are typically system-set, not instructor-facing settings.

---

## 4. Message templates (intervention / TSI)

Intervention messages are **customizable message templates** for reaching out to struggling students. They are not toggles like “enabled_auto_messages”; they are per-course, per-personality templates.

| Concept | Where in EC | API / Notes |
|--------|-------------|-------------|
| **Intervention template: Office Hours Invitation** | Settings → Intervention Messages → “View and Edit Message” (teacher_time) | Uses template type `teacher_time`; links to `message-templates` with `id: 'teacher_time'`. |
| **Intervention template: Supplemental Help** | Settings → Intervention Messages → “View and Edit Message” (course_clues) | Uses template type `course_clues`. |
| **Per-message-type templates** (subject/body) | Message template edit UI (e.g. `/courses/:id/message-templates`) | `Api::MessageTemplatesController` (show, update, reset). Keyed by course + `message_personality` + message_type. |

Personality (`message_personality`) drives which default template set (Coach vs Advisor) is used when no custom template exists; custom templates are stored in `message_templates` table (course, personality, message_type).

---

## 5. Assessments (quiz behavior and visibility)

| Setting | Type | Where set in EC | API / Notes |
|--------|------|-----------------|-------------|
| **Mastery threshold** | 0–100 | Settings → Assessments → Mastery Threshold | See Course-level settings above. |
| **Quiz access in study plans** | boolean | Settings → Assessments → Quiz Access | `show_quiz_in_study_plans` above. |
| **Manage Quiz Attempts** (per module / per student) | additive_attempts | Settings → Assessments → Manage Quiz Attempts | Module-level: `ModuleQuizAttempt` (course_id, outcome_guid, additive_attempts). Student-level: `StudentAssessmentSetting` (additive_attempts). APIs in `Api::EngagementCenter::ModulesController` (e.g. increment/decrement additive attempts). |

Default quiz attempts per module come from `Course::DEFAULT_QUIZ_ATTEMPTS_ALLOWED` (2) plus any `additive_attempts` (module or student). **Not a single “quiz attempts” course setting** in the EC; it’s per-module and per-student.

---

## 6. Time-Sensitive Interventions (TSI)

TSI uses **triggers** and **intervention message templates** (above). There is no separate “enable/disable TSI” course setting in the codebase; triggers are created by the system (e.g. when students struggle), and the EC shows active/inactive triggers and allows sending messages from intervention templates. Instructor-facing “settings” here are:

- Which **intervention templates** to use (Office Hours Invitation, Supplemental Help) and their content (edited in Message Templates).
- **Communication Preferences** (notification_frequency, email_signature) for when the instructor is notified.

---

## 7. Customization (study plan / assessment customization)

These are stored as **customization events** or related customization data (e.g. customization_collection), not plain Course settings. They affect what students see (e.g. hidden topics, assessment customizations).

| Concept | Where in EC | Notes |
|--------|-------------|-------|
| **Study plan customization** (e.g. hide topics) | Customization flows (e.g. Customization landing, topic picker) | Customization events; not in Settings nav. |
| **Assessment customization** (e.g. question visibility, add/edit questions) | Customization → Assessment customization | Customization collection / assessment customizations. |
| **Mastery threshold** | Settings → Assessments | Backed by both Course and CustomizationEvent. |
| **show_quiz_in_study_plans** | Settings → Assessments → Quiz Access | Can be overridden by customization service. |

These are less “personality” and more “course design”; they could still be suggested or simplified based on a quiz (e.g. “minimal vs full customization” path).

---

## 8. Summary: Best candidates for a personality-/onboarding-driven flow

Settings that are **already in the EC** and good candidates to set or suggest from an Agent-driven personality quiz:

1. **message_personality** — Coach vs Advisor; no EC UI today; ideal to set from quiz.
2. **enabled_auto_messages** — Which automated messages (e.g. help_hints, good_game) to enable; could default by “personality.”
3. **mastery_threshold** — Could suggest 70 / 80 / 90 based on quiz (e.g. high-support vs high-standards).
4. **notification_frequency** — “Each time” vs “Do not notify” could map to “high engagement” vs “low notification” style.
5. **course_goals** / **custom_course_goal** / **course_concerns** — Already in API; could be set or suggested from onboarding/quiz.
6. **dismissed_quick_setup** / **dismissed_getting_started** — Onboarding state; quiz could replace or complement current “quick setup” and set these when done.
7. **show_research_consent** / **show_study_plan_rollup** — Could be suggested by “personality” (e.g. research-inclined vs minimal UI).
8. **Messaging teacher** — Quiz could recommend “who should send messages” (e.g. primary instructor) and pre-fill Message Assistant setup.

**Future settings** to consider adding (and then driving from the same quiz):

- Explicit “TSI sensitivity” (e.g. how readily to surface struggling students).
- Default intervention template preference (e.g. more “office hours” vs more “supplemental resources”).
- Optional “expected_enrollments” or “course size” from onboarding for analytics or messaging tone.

---

## 9. Reference: Key files

| Purpose | Location |
|--------|----------|
| Course settings type (TS) | `client/components/EngagementCenter/types/CourseSettings.ts` |
| Course defaults (TS) | `client/components/EngagementCenter/helpers/Course.defaults.ts` |
| Course model (settings, validations) | `app/models/course.rb` |
| Message personalities & types | `app/models/message_template.rb` |
| EC course serializer | `app/serializers/engagement_center/course_serializer.rb` |
| Course update / permitted params | `app/controllers/api/courses_controller.rb` |
| Engagement center load (course, teachers) | `app/controllers/api/users_controller.rb` (#engagement_center, #update_engagement_center) |
| Teacher type & enrollment data | `client/components/EngagementCenter/types/Teacher.ts` |
| Enrollment data (store_accessor) | `app/models/enrollment.rb` |
| Settings nav & pages | `client/components/EngagementCenter/Settings/` (ECSettingsPage, SettingsNavBar, MessageTemplates, InterventionMessages, CommunicationPreferences, Assessments) |
| Message Assistant setup (onboarding) | `client/components/EngagementCenter/Components/MessageAssistantSetup.tsx` |
| Onboarding context | `client/components/EngagementCenter/Onboarding/OnboardingContext.tsx` |

---

*Document generated for use in designing an Agent-driven personality quiz and onboarding experience that set Engagement Center instructor settings.*
