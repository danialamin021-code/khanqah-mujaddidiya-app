import { redirect } from "next/navigation";

export default async function TeacherModulePage({
  params,
}: {
  params: Promise<{ moduleSlug: string }>;
}) {
  const { moduleSlug } = await params;
  redirect(`/teacher/${moduleSlug}/overview`);
}
