import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatAnthropic } from "@langchain/anthropic";
import {
  extractCourseStructure,
  extractAssignmentsAndGrading,
  extractScheduleAndDates,
} from "./tools/syllabus-tools";

export function createSyllabusAnalyzer() {
  const model = new ChatAnthropic({
    model: "claude-sonnet-4-5-20250929",
    temperature: 0,
  });

  return createReactAgent({
    llm: model,
    tools: [
      extractCourseStructure,
      extractAssignmentsAndGrading,
      extractScheduleAndDates,
    ],
    name: "syllabus_analyzer",
    prompt: `You are a syllabus analysis assistant. Your job is to extract structured information from a course syllabus.

You have three tools available. Call ALL THREE tools with the syllabus text to extract different aspects of the course:
1. extract_course_structure — for duration, module count, course format
2. extract_assignments_and_grading — for assignment types and grading policies
3. extract_schedule_and_dates — for key dates and discussion expectations

After calling all three tools, compile the results into a single comprehensive JSON object with these fields:
- courseDuration (string, e.g. "16 weeks")
- assignmentTypes (string array)
- gradingPolicies (string summary)
- discussionExpectations (string summary)
- keyDates (array of {date, description})
- moduleCount (number)
- additionalNotes (string, any other relevant logistics)

Omit any field where the syllabus doesn't provide the information. Return ONLY the final JSON object in your last message, with no markdown formatting or explanation.`,
  });
}
