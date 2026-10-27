import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hasAccess, hasAnyAccess } from "@/lib/access-control";

export async function GET() {
  try {
    if (!await hasAnyAccess(["tests", "create"])) return NextResponse.json({ error: "Test access required." }, { status: 401 });
    const { data: tests, error } = await getSupabase().from("tests").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json(tests.map((test) => ({ ...test, questions: test.questions.map(({ correctIndex, ...question }) => question) })));
  }
  catch (error) { return NextResponse.json({ error: error.message }, { status: 503 }); }
}

export async function POST(request) {
  try {
    if (!await hasAccess("create")) return NextResponse.json({ error: "Test creation access required." }, { status: 401 });
    const test = await request.json();
    if (!test.title?.trim() || !Array.isArray(test.questions) || !test.questions.length || !test.duration_minutes) return NextResponse.json({ error: "Add a title, at least one question, and a time limit." }, { status: 400 });
    const { data, error } = await getSupabase().from("tests").insert({ title: test.title.trim(), description: test.description || "", duration_minutes: Number(test.duration_minutes), questions: test.questions }).select().single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) { return NextResponse.json({ error: error.message }, { status: 503 }); }
}
