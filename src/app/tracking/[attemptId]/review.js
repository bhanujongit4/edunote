"use client";

import { useEffect, useMemo, useState } from "react";
import QuestionImage from "../../question-image";

const FILTERS = [
  { id: "all", label: "All questions" },
  { id: "unattempted", label: "Not attempted" },
  { id: "correct", label: "Correct" },
  { id: "incorrect", label: "Incorrect" },
];

function getQuestionStatus(question, answer) {
  if (answer === undefined || answer === null || Number(answer) < 0) return "unattempted";
  return Number(answer) === Number(question.correctIndex) ? "correct" : "incorrect";
}

export default function AttemptReview({ attemptId }) {
  const [attempt, setAttempt] = useState(null);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/attempts/${attemptId}`).then((response) => response.json()).then((data) => {
      if (!data || data.error) throw new Error(data?.error || "Could not load this attempt.");
      setAttempt(data);
    }).catch((loadError) => setError(loadError.message));
  }, [attemptId]);

  const questions = attempt?.test?.questions || [];
  const counts = useMemo(() => {
    const totals = { all: questions.length, unattempted: 0, correct: 0, incorrect: 0 };
    questions.forEach((question, index) => { totals[getQuestionStatus(question, attempt.answers?.[index])] += 1; });
    return totals;
  }, [attempt, questions]);
  const visibleQuestions = questions.map((question, index) => ({ question, index, status: getQuestionStatus(question, attempt?.answers?.[index]) })).filter((item) => filter === "all" || item.status === filter);

  if (error) return <main className="exam-shell"><p className="form-error" role="alert">{error}</p><a className="secondary-button" href="/tracking">← Back to tracking</a></main>;
  if (!attempt) return <main className="exam-shell"><p className="empty-state">Loading attempt review…</p></main>;

  return <main className="exam-shell review-shell">
    <a className="review-back" href="/tracking">← All attempts</a>
    <section className="exam-heading review-heading"><span className="section-kicker">ATTEMPT REVIEW · {new Date(attempt.submitted_at).toLocaleString()}</span><h1>{attempt.test?.title || "Test attempt"}</h1><p>Review each response and compare it with the correct answer.</p></section>
    <section className="review-score-card"><div><span className="section-kicker">FINAL SCORE</span><strong>{attempt.score}<small> / {attempt.total}</small></strong></div><div className="review-score-track"><span style={{ width: `${attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0}%` }} /></div><span className="review-score-percent">{attempt.total ? Math.round((attempt.score / attempt.total) * 100) : 0}%</span></section>
    <nav className="review-filters" aria-label="Filter question review">{FILTERS.map((item) => <button type="button" key={item.id} className={`review-filter ${item.id}${filter === item.id ? " active" : ""}`} onClick={() => setFilter(item.id)}><span>{item.label}</span><strong>{counts[item.id]}</strong></button>)}</nav>
    <div className="review-question-list">{visibleQuestions.map(({ question, index, status }) => <article className={`review-question ${status}`} key={index}>
      <header className="review-question-head"><span className="review-question-number">Question {index + 1}</span><span className={`review-status ${status}`}>{status === "unattempted" ? "Not attempted" : status === "correct" ? "Correct" : "Incorrect"}</span></header>
      <div className="review-question-prompt">{question.text && <p>{question.text}</p>}{question.imageUrl && <QuestionImage src={question.imageUrl} alt={`Question ${index + 1}`} />}</div>
      <div className="review-options">{question.options.map((option, optionIndex) => {
        const chosen = Number(attempt.answers?.[index]) === optionIndex;
        const correct = Number(question.correctIndex) === optionIndex;
        const classes = ["review-option", chosen && "chosen", correct && "correct-answer", chosen && !correct && "wrong-answer"].filter(Boolean).join(" ");
        return <div className={classes} key={optionIndex}><span className="review-option-letter">{String.fromCharCode(65 + optionIndex)}</span><span className="review-option-text">{option}</span><span className="review-option-tags">{chosen && <span className="your-answer-tag">Your answer</span>}{correct && <span className="correct-answer-tag">Correct answer</span>}</span></div>;
      })}</div>
    </article>)}{!visibleQuestions.length && <p className="empty-state">No questions match this filter.</p>}</div>
  </main>;
}
