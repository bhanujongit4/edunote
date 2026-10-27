import { notFound } from "next/navigation";
import { SUBJECT_DOCUMENTS } from "../../lib/subject-documents";

export async function generateMetadata({ params }) {
  const { subject } = await params;
  const item = SUBJECT_DOCUMENTS[subject];
  return item ? { title: `${item.name} workspace — EduNote`, description: item.description } : {};
}

export default async function SubjectWorkspacePage({ params }) {
  const { subject } = await params;
  const item = SUBJECT_DOCUMENTS[subject];
  if (!item) notFound();
  return <iframe className="physics-frame" src={item.htmlPath} title={`${item.name} workspace`} />;
}
