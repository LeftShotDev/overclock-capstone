import { AdminShell } from "@/components/admin-shell";
import { getQuiz } from "@/lib/actions";
import { EditQuizClient } from "./edit-quiz-client";

export const dynamic = "force-dynamic";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { quiz, questions } = await getQuiz(id);

  return (
    <AdminShell>
      <EditQuizClient quiz={quiz} questionCount={questions.length} />
    </AdminShell>
  );
}
