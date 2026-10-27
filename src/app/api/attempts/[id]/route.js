import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { scoreNeetAttempt } from "@/lib/test-scoring";

export async function GET(_request, { params }) {
  try {
    const { id } = await params;
    const supabase = getSupabase();
    const { data: attempt, error } = await supabase.from("attempts").select("*").eq("id", id).single();
    if (error) throw error;

    let test = attempt.test_snapshot;
    if (!test) {
      const { data, error: testError } = await supabase.from("tests").select("title, questions").eq("id", attempt.test_id).single();
      if (testError) throw testError;
      test = data;
    }
    const result = scoreNeetAttempt(test.questions, attempt.answers);
    return NextResponse.json({ ...attempt, ...result, test });
  } catch (error) {
    return NextResponse.json({ error: error.message || "Could not load this attempt." }, { status: 404 });
  }
}
