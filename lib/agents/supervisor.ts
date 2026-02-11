import { createSupervisor } from "@langchain/langgraph-supervisor";
import { ChatOpenAI } from "@langchain/openai";
import { createQuizAgent } from "./quiz-agent";
import { createPersonaAgent } from "./persona-agent";
import { createCoursewareAgent } from "./courseware-agent";

let _graph: ReturnType<ReturnType<typeof createSupervisor>["compile"]> | null =
  null;

export function getGraph() {
  if (!_graph) {
    const supervisorModel = new ChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
    });

    const quizAgent = createQuizAgent();
    const personaAgent = createPersonaAgent();
    const coursewareAgent = createCoursewareAgent();

    const workflow = createSupervisor({
      agents: [quizAgent, personaAgent, coursewareAgent],
      llm: supervisorModel,
      prompt: `You are the supervisor orchestrating a teaching persona quiz experience for college instructors.

The flow has three phases that MUST happen in order:

1. QUIZ PHASE: Delegate to quiz_agent to run the personality quiz.
   - The quiz_agent asks questions one at a time and collects answers.
   - Do NOT interrupt the quiz. Wait until quiz_agent reports that all questions are answered and results are calculated.

2. PERSONA REVEAL PHASE: Once the quiz_agent returns results with a topPersonaId, delegate to persona_agent.
   - Include the quiz results (especially the topPersonaId and scores) in your handoff message.
   - Let persona_agent do the dramatic reveal.

3. COURSEWARE PHASE: After persona_agent completes the reveal, delegate to courseware_agent.
   - Tell courseware_agent which persona was assigned (name and ID).
   - Let courseware_agent walk through each setting in character.

Rules:
- Always start with quiz_agent when the user first messages.
- Only move to the next phase when the current one is complete.
- Do NOT answer questions yourself — always delegate to the appropriate agent.
- If the user asks something off-topic during a phase, gently redirect them back.
- Pass relevant context between phases (quiz results to persona_agent, persona details to courseware_agent).`,
      outputMode: "last_message",
    });

    _graph = workflow.compile();
  }
  return _graph;
}
