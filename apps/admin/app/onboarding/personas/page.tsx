import { AdminShell } from "@/components/admin-shell";
import { PersonasClient } from "./personas-client";
import { getPersonas } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function PersonasPage() {
  const personas = await getPersonas();

  return (
    <AdminShell>
      <PersonasClient personas={personas} />
    </AdminShell>
  );
}
