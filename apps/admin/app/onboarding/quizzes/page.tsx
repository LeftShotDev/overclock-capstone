import { AdminShell } from "@/components/admin-shell";
import { getQuizzes } from "@/lib/actions";
import { QuizzesClient } from "./quizzes-client";

export const dynamic = "force-dynamic";

export default async function QuizzesPage() {
  const quizzes = await getQuizzes();

  return (
    <AdminShell>
      <QuizzesClient initialQuizzes={quizzes} />
    </AdminShell>
  );
}
