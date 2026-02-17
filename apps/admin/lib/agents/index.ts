import { createCharacterAgent, createCharacterAgentFull } from "./character-agent";

type CharacterGraph = ReturnType<typeof createCharacterAgent>;
type CharacterGraphFull = ReturnType<typeof createCharacterAgentFull>;

let _characterGraph: CharacterGraph | null = null;
let _characterGraphFull: CharacterGraphFull | null = null;

export function getCharacterGraph() {
  if (!_characterGraph) {
    _characterGraph = createCharacterAgent();
  }
  return _characterGraph;
}

/** Full character agent with image search + save tools for the multi-turn wizard. */
export function getCharacterGraphFull() {
  if (!_characterGraphFull) {
    _characterGraphFull = createCharacterAgentFull();
  }
  return _characterGraphFull;
}
