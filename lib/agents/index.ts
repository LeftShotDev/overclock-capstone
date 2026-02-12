import { createCoursewareAgent } from "./courseware-agent";
import { createSyllabusAnalyzer } from "./syllabus-analyzer";

type CoursewareGraph = ReturnType<typeof createCoursewareAgent>;
let _coursewareGraph: CoursewareGraph | null = null;

export function getCoursewareGraph() {
  if (!_coursewareGraph) {
    _coursewareGraph = createCoursewareAgent();
  }
  return _coursewareGraph;
}

type SyllabusGraph = ReturnType<typeof createSyllabusAnalyzer>;
let _syllabusGraph: SyllabusGraph | null = null;

export function getSyllabusGraph() {
  if (!_syllabusGraph) {
    _syllabusGraph = createSyllabusAnalyzer();
  }
  return _syllabusGraph;
}
