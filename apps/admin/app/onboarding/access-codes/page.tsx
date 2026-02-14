import { AdminShell } from "@/components/admin-shell";
import { AccessCodesClient } from "./access-codes-client";
import { getAccessCodes } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function AccessCodesPage() {
  const codes = await getAccessCodes();

  return (
    <AdminShell>
      <AccessCodesClient initialCodes={codes} />
    </AdminShell>
  );
}
