import type { TeachingPersona } from "@/lib/types";

export const PERSONAS: Record<string, TeachingPersona> = {
  explorer: {
    id: "explorer",
    name: "Explorer",
    description:
      "Learning is discovery. Students grow by exploring, experimenting, and making their own connections. Structure should be light enough that curiosity isn't boxed in.",
    resultMessage:
      "You're an **Explorer**. You believe learning happens when students have the freedom to discover, question, and make the material their own. You trust the process — and your students — to find the path forward.",
    masteryThreshold: 70,
    messagePersonality: "coach",
    sendAutoMessages: true,
    enabledAutoMessages: ["help_hints"],
    showStudyPlanRollup: false,
    gradedParticipationEnabled: false,
  },
  nurturer: {
    id: "nurturer",
    name: "Nurturer",
    description:
      "Every student deserves to feel supported and seen. Scaffolding, encouragement, and visible progress markers help students build confidence alongside knowledge.",
    resultMessage:
      "You're a **Nurturer**. You create environments where students feel safe to struggle, grow, and celebrate their wins. You surround them with support systems so no one falls through the cracks.",
    masteryThreshold: 70,
    messagePersonality: "coach",
    sendAutoMessages: true,
    enabledAutoMessages: ["help_hints", "good_game"],
    showStudyPlanRollup: true,
    gradedParticipationEnabled: false,
  },
  mentor: {
    id: "mentor",
    name: "Mentor",
    description:
      "Teaching is a long game. Show up, do the work, build the relationship. Standards matter, but so does meeting students where they are and walking alongside them.",
    resultMessage:
      "You're a **Mentor**. You hold a steady standard and invest in your students for the long haul. Showing up matters to you — and you make sure your students know you're showing up for them, too.",
    masteryThreshold: 80,
    messagePersonality: "coach",
    sendAutoMessages: true,
    enabledAutoMessages: ["help_hints", "good_game"],
    showStudyPlanRollup: true,
    gradedParticipationEnabled: true,
  },
  mastery_coach: {
    id: "mastery_coach",
    name: "Mastery Coach",
    description:
      "High expectations are an act of respect. Students can reach the bar — it's your job to push them there and give them every tool to succeed. No settling.",
    resultMessage:
      "You're a **Mastery Coach**. You set the bar high because you know your students can clear it — and you'll be right there alongside them, pushing, encouraging, and refusing to let them settle for less than their best.",
    masteryThreshold: 90,
    messagePersonality: "coach",
    sendAutoMessages: true,
    enabledAutoMessages: ["help_hints", "good_game"],
    showStudyPlanRollup: true,
    gradedParticipationEnabled: true,
  },
  strategist: {
    id: "strategist",
    name: "Strategist",
    description:
      "Excellence requires clarity. Give students precise feedback, clear expectations, and a structured path. The work speaks for itself — no hand-holding needed.",
    resultMessage:
      "You're a **Strategist**. You believe in clear expectations, precise feedback, and structured paths to excellence. You don't need to sugarcoat — your students respect you because you respect their ability to handle the truth and do the work.",
    masteryThreshold: 90,
    messagePersonality: "advisor",
    sendAutoMessages: true,
    enabledAutoMessages: ["help_hints"],
    showStudyPlanRollup: true,
    gradedParticipationEnabled: true,
  },
};
