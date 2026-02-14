import { AdminShell } from "@/components/admin-shell";
import { EditPersonaClient } from "./edit-persona-client";
import { getPersona } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditPersonaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { persona, characters } = await getPersona(id);

  return (
    <AdminShell>
      <EditPersonaClient persona={persona} characters={characters} />
    </AdminShell>
  );
}
