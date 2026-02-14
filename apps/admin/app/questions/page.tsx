import { AdminShell } from "@/components/admin-shell";
import { QuestionsClient } from "./questions-client";
import { getQuestions } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const questions = await getQuestions();

  return (
    <AdminShell>
      <QuestionsClient initialQuestions={questions} />
    </AdminShell>
  );
}
