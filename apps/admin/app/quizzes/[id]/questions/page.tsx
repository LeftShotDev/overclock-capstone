import { AdminShell } from "@/components/admin-shell";
import { getQuiz, getQuizQuestions } from "@/lib/actions";
import { QuizQuestionsClient } from "./quiz-questions-client";

export const dynamic = "force-dynamic";

export default async function QuizQuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { quiz } = await getQuiz(id);
  const questions = await getQuizQuestions(id);

  return (
    <AdminShell>
      <QuizQuestionsClient
        quiz={quiz}
        initialQuestions={questions}
      />
    </AdminShell>
  );
}
