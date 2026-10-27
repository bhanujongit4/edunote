import { notFound } from "next/navigation";
import FormulaCustomizer from "./formula-customizer";
import { SUBJECT_DOCUMENTS } from "../../../lib/subject-documents";

export async function generateMetadata({ params }) {
  const { subject } = await params;
  const document = SUBJECT_DOCUMENTS[subject];
  return { title: document ? `Customize ${document.name} formulas — EduNote` : "Customize formulas — EduNote" };
}

export default async function CustomizeFormulasPage({ params }) {
  const { subject } = await params;
  if (!SUBJECT_DOCUMENTS[subject]) notFound();
  return <FormulaCustomizer subject={subject} />;
}
