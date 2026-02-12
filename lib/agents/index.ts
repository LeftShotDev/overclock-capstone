import { createCoursewareAgent } from "./courseware-agent";

type CoursewareGraph = ReturnType<typeof createCoursewareAgent>;
let _graph: CoursewareGraph | null = null;

export function getCoursewareGraph() {
  if (!_graph) {
    _graph = createCoursewareAgent();
  }
  return _graph;
}
