import { AdminShell } from "@/components/admin-shell";
import { getCharacters, getPersonas } from "@/lib/actions";
import { CharactersClient } from "./characters-client";

export const dynamic = "force-dynamic";

export default async function CharactersPage() {
  const [characters, personas] = await Promise.all([
    getCharacters(),
    getPersonas(),
  ]);

  return (
    <AdminShell>
      <CharactersClient initialCharacters={characters} personas={personas} />
    </AdminShell>
  );
}
