import { AdminShell } from "@/components/admin-shell";
import { getCharacters, getPersonas } from "@/lib/actions";
import { NewCharacterWizard } from "./new-character-wizard";

export const dynamic = "force-dynamic";

export default async function NewCharacterPage() {
  const [characters, personas] = await Promise.all([
    getCharacters(),
    getPersonas(),
  ]);

  return (
    <AdminShell>
      <NewCharacterWizard
        initialCharacters={characters}
        personas={personas}
      />
    </AdminShell>
  );
}
