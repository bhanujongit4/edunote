"use client";

import { useEffect, useState } from "react";
import QuestionImage from "../../question-image";

const blank = () => ({ text: "", imageUrl: "", options: ["", "", "", ""], correctIndex: 0 });

export default function TestCreator() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(30);
  const [questions, setQuestions] = useState([blank()]);
  const [tests, setTests] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState("");
  const [listError, setListError] = useState("");
  const [loadingTests, setLoadingTests] = useState(true);
  const [saving, setSaving] = useState(false);

  async function refreshTests() {
    setLoadingTests(true);
    try {
      const response = await fetch("/api/tests");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load tests.");
      setTests(data);
      setListError("");
    } catch (error) {
      setListError(error.message);
    } finally {
      setLoadingTests(false);
    }
  }

  useEffect(() => { refreshTests(); }, []);

  function update(index, patch) {
    setQuestions((all) => all.map((question, i) => i === index ? { ...question, ...patch } : question));
  }

  function startNewTest() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setDuration(30);
    setQuestions([blank()]);
    setStatus("");
    document.getElementById("test-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function editTest(id) {
    setStatus("");
    try {
      const response = await fetch(`/api/tests/${id}`);
      const test = await response.json();
      if (!response.ok) throw new Error(test.error || "Could not load this test.");
      setEditingId(test.id);
      setTitle(test.title);
      setDescription(test.description || "");
      setDuration(test.duration_minutes);
      setQuestions(test.questions.map((question) => ({ ...question, options: question.options || ["", "", "", ""] })));
      setStatus("");
      document.getElementById("test-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
    } catch (error) {
      setStatus(error.message);
    }
  }

  async function save(event) {
    event.preventDefault();
    setSaving(true);
    setStatus("");
    try {
      const response = await fetch(editingId ? `/api/tests/${editingId}` : "/api/tests", {
        method: editingId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, duration_minutes: duration, questions }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save this test.");
      if (!editingId) setEditingId(data.id);
      setStatus(editingId ? "Changes saved." : "Test created. You can keep editing it here.");
      await refreshTests();
    } catch (error) {
      setStatus(error.message);
    } finally {
      setSaving(false);
    }
  }

  return <main className="exam-shell">
    <section className="exam-heading">
      <span className="section-kicker">TEST BUILDER</span>
      <h1>{editingId ? <>Edit a <span>test.</span></> : <>Create a <span>test.</span></>}</h1>
      <p>Build a multiple choice test, add question images, and set the time students have to complete it.</p>
    </section>

    <section className="existing-tests" aria-labelledby="existing-tests-title">
      <div className="existing-tests-heading"><div><span className="section-kicker">YOUR LIBRARY</span><h2 id="existing-tests-title">Edit an existing test</h2></div><button className="secondary-button" type="button" onClick={startNewTest}>+ New test</button></div>
      {listError && <p className="form-error" role="alert">{listError}</p>}
      {loadingTests ? <p className="empty-state">Loading your tests…</p> : tests.length ? <div className="existing-test-list">{tests.map((test) => <article className={`existing-test-row${String(editingId) === String(test.id) ? " selected" : ""}`} key={test.id}><div><h3>{test.title}</h3><p>{test.questions.length} questions · {test.duration_minutes} minutes</p></div><button className="text-button" type="button" onClick={() => editTest(test.id)}>{String(editingId) === String(test.id) ? "Editing" : "Edit test →"}</button></article>)}</div> : <p className="empty-state">No tests yet. Create one below to get started.</p>}
    </section>

    <form id="test-form" onSubmit={save} className="exam-form">
      <div className="form-section-heading"><span className="section-kicker">{editingId ? "EDITING TEST" : "NEW TEST"}</span>{editingId && <button type="button" className="text-button" onClick={startNewTest}>Cancel editing</button>}</div>
      <label>Test title<input required value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Fractions practice" /></label>
      <label>Short description<textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="What should the student know before starting?" rows="2" /></label>
      <label>Time limit (minutes)<input required type="number" min="1" max="300" value={duration} onChange={(event) => setDuration(event.target.value)} /></label>
      {questions.map((question, index) => <fieldset className="question-editor" key={index}>
        <legend>Question {index + 1}</legend>
        <label>Question text<textarea value={question.text} onChange={(event) => update(index, { text: event.target.value })} placeholder="Write the question…" rows="3" /></label>
        <label>Image URL (optional)<input type="url" value={question.imageUrl} onChange={(event) => update(index, { imageUrl: event.target.value })} placeholder="Paste a Google Drive share link or direct image URL" /><small>Set the Drive image’s General access to “Anyone with the link”. The preview converts common Drive share links automatically.</small></label>
        {question.imageUrl && <QuestionImage key={`${index}-${question.imageUrl}`} src={question.imageUrl} alt={`Question ${index + 1} preview`} />}
        <div className="option-list"><span className="section-kicker">ANSWER OPTIONS · SELECT THE CORRECT ONE</span>{question.options.map((option, optionIndex) => <div className="option-row" key={optionIndex}><input type="radio" name={`correct-${index}`} checked={question.correctIndex === optionIndex} onChange={() => update(index, { correctIndex: optionIndex })} aria-label={`Option ${optionIndex + 1} is correct`} /><input required value={option} onChange={(event) => update(index, { options: question.options.map((value, i) => i === optionIndex ? event.target.value : value) })} placeholder={`Option ${optionIndex + 1}`} /><button type="button" className="remove-option" onClick={() => update(index, { options: question.options.filter((_, i) => i !== optionIndex), correctIndex: Math.min(question.correctIndex, question.options.length - 2) })} disabled={question.options.length <= 2} aria-label="Remove option">×</button></div>)}<button type="button" className="text-button" onClick={() => update(index, { options: [...question.options, ""] })}>+ Add option</button></div>
        <button type="button" className="text-button danger" onClick={() => setQuestions((all) => all.length > 1 ? all.filter((_, i) => i !== index) : all)}>Remove question</button>
      </fieldset>)}
      <button type="button" className="secondary-button" onClick={() => setQuestions((all) => [...all, blank()])}>+ Add question</button>
      {status && <p className={status.includes("saved") || status.includes("created") ? "form-success" : "form-error"} role="status">{status}</p>}
      <button className="primary-button" disabled={saving}>{saving ? "Saving…" : editingId ? "Save changes" : "Create test"}<span>→</span></button>
    </form>
  </main>;
}
