"use client";

import { useEffect, useState } from "react";
import QuestionImage from "../../question-image";

export default function TestAttempt({ id }) {
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [seconds, setSeconds] = useState(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(null);
  const [started, setStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [visited, setVisited] = useState(new Set());
  const [endAt, setEndAt] = useState(null);
  const [draftReady, setDraftReady] = useState(false);
  const [autoSubmitFailed, setAutoSubmitFailed] = useState(false);
  const draftKey = `edunote-test-draft-${id}`;

  useEffect(() => {
    fetch("/api/tests").then((response) => response.json()).then((data) => {
      if (data.error) throw new Error(data.error);
      const found = data.find((item) => String(item.id) === id);
      if (!found) throw new Error("Test not found.");
      setTest(found);
      let draft = null;
      try { draft = JSON.parse(window.localStorage.getItem(draftKey) || "null"); } catch { try { window.localStorage.removeItem(draftKey); } catch { /* Ignore unavailable storage. */ } }
      if (draft && Number.isFinite(draft.endAt)) {
        const nextQuestion = Math.max(0, Math.min(found.questions.length - 1, Number(draft.currentQuestion) || 0));
        setAnswers(draft.answers && typeof draft.answers === "object" ? draft.answers : {});
        setCurrentQuestion(nextQuestion);
        setVisited(new Set(Array.isArray(draft.visited) ? draft.visited : [nextQuestion]));
        setEndAt(draft.endAt);
        setSeconds(Math.max(0, Math.ceil((draft.endAt - Date.now()) / 1000)));
        setStarted(true);
      } else {
        setSeconds(found.duration_minutes * 60);
      }
      setDraftReady(true);
    }).catch((loadError) => setError(loadError.message));
  }, [id, draftKey]);

  useEffect(() => {
    if (!draftReady || !started || submitted || endAt === null || autoSubmitFailed) return;
    let interval;
    const updateRemaining = () => {
      const remaining = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
      setSeconds(remaining);
      if (remaining === 0) {
        clearInterval(interval);
        submit({ requireConfirmation: false, automatic: true });
      }
    };
    interval = setInterval(updateRemaining, 1000);
    updateRemaining();
    return () => clearInterval(interval);
  }, [draftReady, started, submitted, endAt, answers, autoSubmitFailed]);

  useEffect(() => {
    if (!draftReady || !started || endAt === null || submitted) return;
    try {
      window.localStorage.setItem(draftKey, JSON.stringify({ endAt, answers, currentQuestion, visited: [...visited] }));
    } catch { /* Keep the attempt active if local storage is unavailable. */ }
  }, [draftReady, started, submitted, endAt, answers, currentQuestion, visited, draftKey]);

  async function submit({ requireConfirmation = true, automatic = false } = {}) {
    if (!test || submitted) return;
    if (requireConfirmation && !window.confirm("Are you sure you want to submit this test? You will not be able to change your answers after submission.")) return;
    setAutoSubmitFailed(false);
    setSubmitted({ saving: true });
    try {
      const response = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ test_id: test.id, answers: test.questions.map((_, index) => answers[index] ?? -1) }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      try { window.localStorage.removeItem(draftKey); } catch { /* Submission is complete even if local storage cannot be cleared. */ }
      setSubmitted(data);
    } catch (submitError) {
      setSubmitted(null);
      setError(submitError.message);
      if (automatic) setAutoSubmitFailed(true);
    }
  }

  function goToQuestion(index) {
    setCurrentQuestion(index);
    setVisited((previous) => new Set(previous).add(index));
  }

  function startTest() {
    const now = Date.now();
    const deadline = now + Number(test.duration_minutes) * 60 * 1000;
    const initialVisited = new Set([0]);
    setAnswers({});
    setCurrentQuestion(0);
    setVisited(initialVisited);
    setEndAt(deadline);
    setSeconds(Math.max(0, Math.ceil((deadline - now) / 1000)));
    setAutoSubmitFailed(false);
    try { window.localStorage.setItem(draftKey, JSON.stringify({ endAt: deadline, answers: {}, currentQuestion: 0, visited: [0] })); } catch { /* The running timer still works without a saved draft. */ }
    setStarted(true);
  }

  if (error && !test) return <main className="exam-shell"><p className="form-error" role="alert">{error}</p></main>;
  if (!test) return <main className="exam-shell"><p className="empty-state">Loading test…</p></main>;
  if (submitted && !submitted.saving) return <main className="exam-shell"><section className="exam-heading"><span className="section-kicker">ATTEMPT SAVED</span><h1>Nice <span>work.</span></h1><p>Your score: <strong>{submitted.score} / {submitted.total}</strong>. Every attempt is saved in tracking.</p></section><a className="primary-button" href="/tracking">View tracking <span>→</span></a></main>;

  const formatTime = (value) => `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
  const question = test.questions[currentQuestion];

  if (!started) return <main className="exam-shell"><section className="exam-heading"><span className="section-kicker">{test.questions.length} QUESTIONS · {test.duration_minutes} MINUTES</span><h1>{test.title}</h1><p>{test.description}</p></section><button className="primary-button" onClick={startTest}>Start test <span>→</span></button></main>;

  return <main className="exam-shell test-taking">
    <header className="jee-topbar">
      <div className="jee-test-name"><span className="section-kicker">EDUNOTE · ONLINE TEST</span><h1>{test.title}</h1></div>
      <div className="jee-topbar-meta"><span>{test.questions.length} questions</span><div className={`jee-timer${seconds < 60 ? " urgent" : ""}`} aria-live="off"><span aria-hidden="true">◷</span>{formatTime(seconds ?? 0)}<small>TIME LEFT</small></div></div>
    </header>

    <div className="jee-layout">
      <section className="jee-main-panel" aria-label={`Question ${currentQuestion + 1}`}>
        <div className="jee-question-toolbar"><span>Question <strong>{currentQuestion + 1}</strong> <span className="jee-of-total">of {test.questions.length}</span></span><div className="jee-question-actions"><span className="jee-mark">Single choice</span><button className="jee-clear-button" type="button" onClick={() => setAnswers((previous) => { const next = { ...previous }; delete next[currentQuestion]; return next; })} disabled={answers[currentQuestion] === undefined}>Clear response</button></div></div>
        <div className="jee-question-content">
          {question.text && <h2>{question.text}</h2>}
          {question.imageUrl && <QuestionImage src={question.imageUrl} alt={`Question ${currentQuestion + 1}`} />}
          {!question.text && !question.imageUrl && <h2>Question {currentQuestion + 1}</h2>}
          <fieldset className="jee-options"><legend>Choose one answer</legend>{question.options.map((option, optionIndex) => <label className={answers[currentQuestion] === optionIndex ? "selected" : ""} key={optionIndex}><input type="radio" name={`question-${currentQuestion}`} checked={answers[currentQuestion] === optionIndex} onChange={() => setAnswers((previous) => ({ ...previous, [currentQuestion]: optionIndex }))} /><span className="jee-option-letter">{String.fromCharCode(65 + optionIndex)}</span><span>{option}</span></label>)}</fieldset>
        </div>
        {error && <p className="form-error jee-error" role="alert">{error}</p>}
        <footer className="jee-question-footer"><button type="button" className="secondary-button" onClick={() => goToQuestion(currentQuestion - 1)} disabled={currentQuestion === 0}>← Previous</button><span>{currentQuestion + 1} of {test.questions.length}</span>{currentQuestion < test.questions.length - 1 ? <button type="button" className="primary-button" onClick={() => goToQuestion(currentQuestion + 1)}>Save &amp; Next <span>→</span></button> : <button type="button" className="primary-button" onClick={() => submit()} disabled={submitted?.saving}>{submitted?.saving ? "Submitting…" : "Submit test"}<span>✓</span></button>}</footer>
      </section>

      <aside className="jee-sidebar" aria-label="Question navigation">
        <div className="jee-sidebar-heading"><div><span className="section-kicker">TEST NAVIGATION</span><h2>Question palette</h2></div><span className="jee-total-pill">{test.questions.length}</span></div>
        <p className="jee-sidebar-instruction">Select a question to go directly to it.</p>
        <div className="jee-palette" role="group" aria-label="Choose a question">{test.questions.map((_, index) => {
          const status = answers[index] !== undefined ? "answered" : visited.has(index) ? "unanswered" : "not-visited";
          const label = status === "answered" ? "answered" : status === "unanswered" ? "not answered" : "not visited";
          return <button key={index} type="button" className={`jee-palette-button ${status}${index === currentQuestion ? " current" : ""}`} onClick={() => goToQuestion(index)} aria-label={`Question ${index + 1}, ${label}`} aria-current={index === currentQuestion ? "step" : undefined} title={`Question ${index + 1}: ${label}`}>{index + 1}</button>;
        })}</div>
        <div className="jee-legend"><span><i className="answered" />Answered</span><span><i className="unanswered" />Not answered</span><span><i className="not-visited" />Not visited</span></div>
        <div className="jee-sidebar-progress"><span>Answered</span><strong>{Object.keys(answers).length} / {test.questions.length}</strong></div>
        <button type="button" className="jee-submit-button" onClick={() => submit()} disabled={submitted?.saving}>{submitted?.saving ? "Submitting…" : "Submit test"}</button>
      </aside>
    </div>
  </main>;
}
