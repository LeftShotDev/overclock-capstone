import { createCharacterAgent } from "./character-agent";

type CharacterGraph = ReturnType<typeof createCharacterAgent>;
let _characterGraph: CharacterGraph | null = null;

export function getCharacterGraph() {
  if (!_characterGraph) {
    _characterGraph = createCharacterAgent();
  }
  return _characterGraph;
}
