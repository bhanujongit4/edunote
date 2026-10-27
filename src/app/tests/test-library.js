"use client";
import { useEffect, useState } from "react";
export default function TestLibrary() {
 const [tests, setTests] = useState([]); const [error, setError] = useState("");
 useEffect(() => { fetch("/api/tests").then(r => r.json()).then(d => d.error ? setError(d.error) : setTests(d)).catch(() => setError("Could not load tests.")); }, []);
 return <main className="exam-shell"><section className="exam-heading"><span className="section-kicker">PRACTICE LIBRARY</span><h1>Your <span>tests.</span></h1><p>Choose a test to begin. Each submission is saved as a separate attempt.</p></section>{error && <p className="form-error" role="alert">{error}</p>}<div className="test-list">{tests.map(test => <article className="test-card" key={test.id}><div><span className="section-kicker">{test.questions.length} QUESTIONS · {test.duration_minutes} MIN</span><h2>{test.title}</h2><p>{test.description || "Ready when you are."}</p></div><a className="primary-button" href={`/tests/${test.id}`}>Attempt test <span>→</span></a></article>)}{!tests.length && !error && <p className="empty-state">No tests yet. Create the first one to get started.</p>}</div></main>;
}
