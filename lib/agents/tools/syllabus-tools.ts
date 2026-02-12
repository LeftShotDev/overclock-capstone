import { tool } from "@langchain/core/tools";
import { z } from "zod";

export const extractCourseStructure = tool(
  async ({ syllabusText }: { syllabusText: string }) => {
    // This tool is called by the ReAct agent to focus extraction on structure
    return JSON.stringify({
      instruction:
        "Extract the following from this syllabus text. Return JSON with: courseDuration (e.g. '16 weeks', '1 semester'), moduleCount (number of modules/units/weeks of content), and any notes about course format (online, in-person, hybrid).",
      text: syllabusText.slice(0, 5000),
    });
  },
  {
    name: "extract_course_structure",
    description:
      "Analyze the syllabus text to extract course structure: duration, number of modules/units, and course format. Pass the full syllabus text.",
    schema: z.object({
      syllabusText: z.string().describe("The full syllabus text to analyze"),
    }),
  }
);

export const extractAssignmentsAndGrading = tool(
  async ({ syllabusText }: { syllabusText: string }) => {
    return JSON.stringify({
      instruction:
        "Extract the following from this syllabus text. Return JSON with: assignmentTypes (array of strings like 'essays', 'quizzes', 'group projects', 'presentations', 'exams'), and gradingPolicies (summary of how grading works — weighting, curves, pass/fail, late penalties).",
      text: syllabusText.slice(0, 5000),
    });
  },
  {
    name: "extract_assignments_and_grading",
    description:
      "Analyze the syllabus text to extract assignment types and grading policies. Pass the full syllabus text.",
    schema: z.object({
      syllabusText: z.string().describe("The full syllabus text to analyze"),
    }),
  }
);

export const extractScheduleAndDates = tool(
  async ({ syllabusText }: { syllabusText: string }) => {
    return JSON.stringify({
      instruction:
        "Extract the following from this syllabus text. Return JSON with: keyDates (array of {date, description} for important dates like start/end dates, midterm, final, project deadlines), and discussionExpectations (what is expected regarding class discussion or forum participation).",
      text: syllabusText.slice(0, 5000),
    });
  },
  {
    name: "extract_schedule_and_dates",
    description:
      "Analyze the syllabus text to extract key dates, schedule information, and discussion participation expectations. Pass the full syllabus text.",
    schema: z.object({
      syllabusText: z.string().describe("The full syllabus text to analyze"),
    }),
  }
);
