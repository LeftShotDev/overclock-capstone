import { AdminShell } from "@/components/admin-shell";
import { ResultsClient } from "./results-client";
import { getResults, getResultStats } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function ResultsPage() {
  const [{ results, total }, stats] = await Promise.all([
    getResults(),
    getResultStats(),
  ]);

  return (
    <AdminShell>
      <ResultsClient
        initialResults={results}
        total={total}
        stats={stats}
      />
    </AdminShell>
  );
}
