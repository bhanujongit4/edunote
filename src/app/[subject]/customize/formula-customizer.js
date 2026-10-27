"use client";

import { useEffect, useMemo, useState } from "react";
import ThemeToggle from "../../theme-toggle";
import { parseFormulaObject, replaceFormulaObject, SUBJECT_DOCUMENTS } from "../../../lib/subject-documents";

export default function FormulaCustomizer({ subject }) {
  const document = SUBJECT_DOCUMENTS[subject];
  const [sourceHtml, setSourceHtml] = useState("");
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [drafts, setDrafts] = useState({});
  const [newCategory, setNewCategory] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch(document.htmlPath)
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${document.name} HTML.`);
        return response.text();
      })
      .then((html) => {
        if (cancelled) return;
        setSourceHtml(html);
        setForm(parseFormulaObject(html));
      })
      .catch((cause) => { if (!cancelled) setError(cause.message || "Could not load formula data."); });
    return () => { cancelled = true; };
  }, [document.htmlPath, document.name]);

  const categories = useMemo(() => {
    if (!form) return [];
    const query = search.trim().toLocaleLowerCase();
    return Object.entries(form).filter(([name, formulas]) => !query || name.toLocaleLowerCase().includes(query) || formulas.some((formula) => formula.toLocaleLowerCase().includes(query)));
  }, [form, search]);

  function updateCategory(category, formulas) {
    setForm((current) => ({ ...current, [category]: formulas }));
  }

  function removeCategory(category) {
    setForm((current) => Object.fromEntries(Object.entries(current).filter(([name]) => name !== category)));
  }

  function addFormula(category) {
    const value = (drafts[category] || "").trim();
    if (!value) return;
    updateCategory(category, [...form[category], value]);
    setDrafts((current) => ({ ...current, [category]: "" }));
  }

  function addCategory(event) {
    event.preventDefault();
    const name = newCategory.trim();
    if (!name || Object.hasOwn(form, name)) return;
    setForm((current) => ({ ...current, [name]: [] }));
    setNewCategory("");
  }

  function downloadHtml() {
    try {
      const editedHtml = replaceFormulaObject(sourceHtml, form);
      const url = URL.createObjectURL(new Blob([editedHtml], { type: "text/html;charset=utf-8" }));
      const link = window.document.createElement("a");
      link.href = url;
      link.download = `${subject}-custom-formulas.html`;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      setError(cause.message || "Could not create the customized HTML file.");
    }
  }

  const formulaCount = form ? Object.values(form).reduce((total, items) => total + items.length, 0) : 0;

  return (
    <main className="customizer-shell">
      <header className="customizer-nav">
        <a className="brand" href="/" aria-label="EduNote home"><span className="brand-mark">e</span> edunote</a>
        <div className="customizer-nav-actions"><a className="nav-link" href={`/${subject}`}>← Back to {document.name}</a><ThemeToggle /></div>
      </header>
      <section className="customizer-heading">
        <div className="eyebrow"><span className="status-dot" /> {document.name.toUpperCase()} WORKSPACE</div>
        <div className="customizer-title-row"><div><h1>Customize your<br /><span>formula sheet.</span></h1><p>Choose the formulas that appear in the Math panel of your downloaded workspace.</p></div>
          <button className="download-html" type="button" onClick={downloadHtml} disabled={!form || Boolean(error)}>Download customized HTML <span aria-hidden="true">↓</span></button>
        </div>
        <div className="customizer-meta"><span>{form ? `${formulaCount} FORMULAS · ${Object.keys(form).length} TOPICS` : "LOADING FORMULAS…"}</span><span>YOUR ORIGINAL WORKSPACE STAYS UNCHANGED</span></div>
      </section>
      {error && <div className="customizer-error" role="alert">{error}</div>}
      <section className="formula-editor" aria-label="Formula editor">
        <div className="editor-toolbar"><div><span className="section-kicker">EDIT THE CONTENTS</span><h2>Topics and formulas</h2></div><input className="formula-search" type="search" placeholder="Search topics or formulas" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search topics or formulas" /></div>
        {!form && !error && <div className="editor-loading">Reading formula data from the Physics HTML…</div>}
        {form && categories.length === 0 && <div className="editor-loading">No topics or formulas match that search.</div>}
        <div className="formula-category-grid">{categories.map(([category, formulas]) => (
          <article className="formula-category" key={category}>
            <header className="formula-category-head"><div><span className="card-number">TOPIC</span><h3>{category}</h3></div><button type="button" className="remove-topic" onClick={() => removeCategory(category)} aria-label={`Remove ${category} topic`}>Remove topic</button></header>
            <ul className="formula-list">{formulas.map((formula, index) => <li key={`${formula}-${index}`}><span>{formula}</span><button type="button" className="remove-formula" onClick={() => updateCategory(category, formulas.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Remove formula ${formula}`}>×</button></li>)}</ul>
            <form className="add-formula" onSubmit={(event) => { event.preventDefault(); addFormula(category); }}><input value={drafts[category] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [category]: event.target.value }))} placeholder="Type a formula" aria-label={`Add a formula to ${category}`} /><button type="submit" disabled={!(drafts[category] || "").trim()}>Add formula</button></form>
          </article>
        ))}</div>
        {form && <form className="add-topic" onSubmit={addCategory}><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New topic name" aria-label="New topic name" /><button type="submit" disabled={!newCategory.trim()}>Add a topic</button></form>}
      </section>
      <footer className="customizer-footer"><a className="brand" href="/">EduNote</a><span>Keep what you need. Leave out the rest.</span><a href={`/${subject}`}>Return to workspace ↑</a></footer>
    </main>
  );
}

