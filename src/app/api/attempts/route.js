import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { scoreNeetAttempt } from "@/lib/test-scoring";

export async function GET() {
  try {
    const { data, error } = await getSupabase().from("attempts").select("id, test_id, score, total, answers, test_snapshot, submitted_at, tests(title, questions)").order("submitted_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data.map((attempt) => {
      const questions = attempt.test_snapshot?.questions || attempt.tests?.questions;
      const result = questions ? scoreNeetAttempt(questions, attempt.answers) : { score: attempt.score, total: attempt.total };
      return { id: attempt.id, test_id: attempt.test_id, submitted_at: attempt.submitted_at, score: result.score, total: result.total, tests: { title: attempt.test_snapshot?.title || attempt.tests?.title || "Test" } };
    }));
  }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 503 }); }
}

export async function POST(request) {
  try {
    const { test_id, answers } = await request.json();
    const { data: test, error: testError } = await getSupabase().from("tests").select("id,title,questions").eq("id", test_id).single();
    if (testError) throw testError;
    if (!test || !Array.isArray(answers)) return NextResponse.json({ error: "Test not found or invalid answers." }, { status: 400 });
    const questions = test.questions;
    const result = scoreNeetAttempt(questions, answers);
    const testSnapshot = { title: test.title, questions };
    const { data, error } = await getSupabase().from("attempts").insert({ test_id, score: result.score, total: result.total, answers, test_snapshot: testSnapshot }).select().single();
    if (error) throw error;
    return NextResponse.json({ ...data, title: test.title }, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 503 }); }
}
