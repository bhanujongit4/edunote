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
  const [activeCategory, setActiveCategory] = useState("");

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

  function removeFormula(category, formula) {
    setForm((current) => {
      const formulas = [...current[category]];
      const index = formulas.indexOf(formula);
      if (index >= 0) formulas.splice(index, 1);
      return { ...current, [category]: formulas };
    });
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
    setActiveCategory(name);
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
  const activeName = categories.some(([name]) => name === activeCategory) ? activeCategory : categories[0]?.[0];
  const activeFormulas = activeName ? form[activeName].filter((formula) => !search.trim() || formula.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()) || activeName.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())) : [];

  return (
    <main className="customizer-shell">
      <header className="customizer-nav">
        <a className="brand wordmark" href="/" aria-label="EduNote home">edunote</a>
        <div className="customizer-nav-actions"><a className="nav-link" href={`/${subject}`}>← Back to {document.name}</a><ThemeToggle /></div>
      </header>
      <section className="customizer-heading">
        <div className="eyebrow"><span className="status-dot" /> {document.name.toUpperCase()} WORKSPACE</div>
        <div className="customizer-title-row"><div><h1>Make your formula<br /><span>sheet yours.</span></h1><p>Keep the equations you need. Add your own, remove the rest, then download your personalized workspace.</p></div>
          <button className="download-html" type="button" onClick={downloadHtml} disabled={!form || Boolean(error)}>Download HTML <span aria-hidden="true">↓</span></button>
        </div>
        <div className="customizer-meta"><span>{form ? `${formulaCount} FORMULAS · ${Object.keys(form).length} TOPICS` : "LOADING FORMULAS…"}</span><span>YOUR ORIGINAL WORKSPACE STAYS UNCHANGED</span></div>
      </section>
      {error && <div className="customizer-error" role="alert">{error}</div>}
      <section className="formula-editor" aria-label="Formula editor">
        <aside className="topic-rail">
          <div className="topic-rail-heading"><div><span>ORGANIZE</span><h2>Your topics</h2></div><span className="topic-total">{categories.length.toString().padStart(2, "0")}</span></div>
          <label className="formula-search-wrap"><span>Find a topic or formula</span><input className="formula-search" type="search" placeholder="Search…" value={search} onChange={(event) => setSearch(event.target.value)} aria-label="Search topics or formulas" /></label>
          <div className="topic-rail-label">FORMULA SECTIONS</div>
          <nav className="topic-list" aria-label="Formula topics">{categories.map(([category, formulas], index) => <button type="button" className={`topic-item${activeName === category ? " active" : ""}`} key={category} onClick={() => setActiveCategory(category)}><span className="topic-index">{String(index + 1).padStart(2, "0")}</span><span className="topic-name">{category}</span><small>{formulas.length}</small></button>)}</nav>
          {form && <form className="add-topic" onSubmit={addCategory}><input value={newCategory} onChange={(event) => setNewCategory(event.target.value)} placeholder="New topic name" aria-label="New topic name" /><button type="submit" disabled={!newCategory.trim()} aria-label="Add topic">+</button></form>}
        </aside>
        <div className="formula-workspace">
          {!form && !error && <div className="editor-loading">Reading formula data from the {document.name} HTML…</div>}
          {form && !activeName && <div className="editor-loading">No topics match your search. Clear the search or add a new topic.</div>}
          {form && activeName && <>
            <header className="active-topic-head"><div><span className="section-kicker">FORMULA TOPIC</span><h2>{activeName}</h2><p>{activeFormulas.length} {activeFormulas.length === 1 ? "formula" : "formulas"} in this topic</p></div><button type="button" className="remove-topic" onClick={() => removeCategory(activeName)}>Remove topic</button></header>
            <ul className="formula-list">{activeFormulas.map((formula, index) => <li key={`${formula}-${index}`}><span>{formula}</span><button type="button" className="remove-formula" onClick={() => removeFormula(activeName, formula)} aria-label={`Remove formula ${formula}`}>×</button></li>)}</ul>
            {activeFormulas.length === 0 && <p className="empty-formulas">No formulas here yet. Add one below.</p>}
            <form className="add-formula" onSubmit={(event) => { event.preventDefault(); addFormula(activeName); }}><input value={drafts[activeName] || ""} onChange={(event) => setDrafts((current) => ({ ...current, [activeName]: event.target.value }))} placeholder="Write a formula or equation" aria-label={`Add a formula to ${activeName}`} /><button type="submit" disabled={!(drafts[activeName] || "").trim()}>Add formula <span>＋</span></button></form>
          </>}
        </div>
      </section>
      <footer className="customizer-footer"><a className="brand wordmark" href="/" aria-label="EduNote home">edunote</a><span>Keep what you need. Leave out the rest.</span><a href={`/${subject}`}>Return to workspace ↑</a></footer>
    </main>
  );
}

