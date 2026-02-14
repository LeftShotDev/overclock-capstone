import { AdminShell } from "@/components/admin-shell";
import { EditQuestionClient } from "./edit-question-client";
import { getQuestion } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await getQuestion(id);

  return (
    <AdminShell>
      <EditQuestionClient question={question} />
    </AdminShell>
  );
}
