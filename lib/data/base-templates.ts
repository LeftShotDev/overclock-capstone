export interface BaseTemplate {
  triggerDescription: string;
  variants: string[];
}

export const BASE_TEMPLATES: Record<string, BaseTemplate> = {
  help_hints: {
    triggerDescription:
      "Student scores below mastery threshold on an assessment — encourage retry and offer specific guidance.",
    variants: [
      "That section was challenging, but you made progress. Try reviewing the hints on the questions you missed — you're closer than you think.",
      "Not quite at mastery yet, but that's what practice is for. Take another look at the flagged sections and give it another try.",
      "You put in solid effort. Check out the study guide for the topics you missed — a little focused review will go a long way.",
    ],
  },
  good_game: {
    triggerDescription:
      "Student achieves mastery on an assessment — celebrate the achievement and encourage momentum.",
    variants: [
      "You hit mastery on this one — that's the result of real effort. Keep that momentum going into the next section.",
      "Mastery achieved! You put in the work and it shows. On to the next challenge.",
      "That's a strong result. You clearly know this material. Carry that confidence forward.",
    ],
  },
};
