import { NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { hasAccess } from "@/lib/access-control";

export async function GET(_request, { params }) {
  try {
    if (!await hasAccess("create")) return NextResponse.json({ error: "Test creation access required." }, { status: 401 });
    const { id } = await params;
    const { data, error } = await getSupabase().from("tests").select("*").eq("id", id).single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }
}

export async function PATCH(request, { params }) {
  try {
    if (!await hasAccess("create")) return NextResponse.json({ error: "Test creation access required." }, { status: 401 });
    const { id } = await params;
    const test = await request.json();
    if (!test.title?.trim() || !Array.isArray(test.questions) || !test.questions.length || !Number(test.duration_minutes)) {
      return NextResponse.json({ error: "Add a title, at least one question, and a time limit." }, { status: 400 });
    }
    const { data, error } = await getSupabase().from("tests").update({
      title: test.title.trim(),
      description: test.description || "",
      duration_minutes: Number(test.duration_minutes),
      questions: test.questions,
    }).eq("id", id).select().single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 503 });
  }
}
