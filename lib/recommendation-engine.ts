import type { QuizResult, ConstraintAnswer, SyllabusData } from "@/lib/types";

export interface RecommendationInput {
  quizResult: QuizResult;
  constraintAnswers: ConstraintAnswer[];
  syllabusData: SyllabusData | null;
}

function getConstraint(answers: ConstraintAnswer[], key: string) {
  return answers.find((a) => a.constraintKey === key)?.selectedValue;
}

export function computeRecommendations(
  input: RecommendationInput
): Record<string, string> {
  const { quizResult, constraintAnswers, syllabusData } = input;
  const persona = quizResult.topPersonaId;
  const timeHorizon = getConstraint(constraintAnswers, "courseStartDate");
  const customizationTime = getConstraint(
    constraintAnswers,
    "customizationTime"
  );

  const recommendations: Record<string, string> = {};

  // ── due-dates ──────────────────────────────────────────────
  let dueDates = "flexible";
  if (persona === "the-architect") dueDates = "strict";
  else if (persona === "the-sage") dueDates = "strict";
  else if (persona === "the-explorer") dueDates = "suggested";
  else if (persona === "the-coach") dueDates = "flexible";
  // If course is imminent with minimal customization time, keep it simple
  if (timeHorizon === "imminent" && customizationTime === "minimal") {
    dueDates = "strict";
  }
  recommendations["due-dates"] = dueDates;

  // ── grading-visibility ─────────────────────────────────────
  let gradingVis = "after-grading";
  if (persona === "the-coach") gradingVis = "immediate";
  else if (persona === "the-explorer") gradingVis = "immediate";
  else if (persona === "the-architect") gradingVis = "after-grading";
  else if (persona === "the-sage") gradingVis = "end-of-module";
  recommendations["grading-visibility"] = gradingVis;

  // ── late-submission ────────────────────────────────────────
  let lateSub = "grace-period";
  if (persona === "the-architect") lateSub = "penalty-per-day";
  else if (persona === "the-explorer") lateSub = "always-open";
  else if (persona === "the-sage") lateSub = "penalty-per-day";
  else if (persona === "the-coach") lateSub = "grace-period";
  // Syllabus override: explicit late policy mentioned
  if (syllabusData?.gradingPolicies) {
    const policies = syllabusData.gradingPolicies.toLowerCase();
    if (policies.includes("no late") || policies.includes("no-late")) {
      lateSub = "no-late";
    } else if (policies.includes("penalty")) {
      lateSub = "penalty-per-day";
    }
  }
  recommendations["late-submission"] = lateSub;

  // ── discussion-boards ──────────────────────────────────────
  let discussion = "open-view";
  if (persona === "the-sage") discussion = "post-first";
  else if (persona === "the-coach") discussion = "graded-participation";
  else if (persona === "the-architect") discussion = "post-first";
  else if (persona === "the-explorer") discussion = "open-view";
  // Syllabus override: discussion expectations
  if (syllabusData?.discussionExpectations) {
    const expectations =
      syllabusData.discussionExpectations.toLowerCase();
    if (expectations.includes("required") || expectations.includes("graded")) {
      discussion = "graded-participation";
    } else if (expectations.includes("optional")) {
      discussion = "optional";
    }
  }
  recommendations["discussion-boards"] = discussion;

  // ── content-release ────────────────────────────────────────
  let contentRelease = "weekly";
  if (persona === "the-explorer") contentRelease = "all-at-once";
  else if (persona === "the-architect") contentRelease = "prerequisite-based";
  else if (persona === "the-sage") contentRelease = "weekly";
  else if (persona === "the-coach") contentRelease = "weekly";
  // Imminent start → keep it simple with weekly
  if (timeHorizon === "imminent") contentRelease = "weekly";
  // Many modules → prerequisite-based helps pacing
  if (syllabusData?.moduleCount && syllabusData.moduleCount > 12) {
    contentRelease = "prerequisite-based";
  }
  recommendations["content-release"] = contentRelease;

  return recommendations;
}
