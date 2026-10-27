import ThemeToggle from "./theme-toggle";
import { SUBJECT_DOCUMENTS } from "../lib/subject-documents";

const subjects = Object.entries(SUBJECT_DOCUMENTS).map(([slug, subject]) => ({ ...subject, href: `/${slug}` }));

export default function Home() {
  return (
    <main className="home-shell">
      <nav className="home-nav" aria-label="Main navigation"><a className="brand wordmark" href="/" aria-label="EduNote home">Edunote</a><div className="nav-actions"><a className="nav-link" href="#subjects">Subjects <span aria-hidden="true">↓</span></a><ThemeToggle /></div></nav>
      <section className="hero">
        <div className="eyebrow"><span className="status-dot" /> A SIMPLE WHITEBOARD FOR TEACHERS</div>
        <h1>Teach on a<br /><span>whiteboard.</span></h1>
        <p className="hero-copy">Draw, annotate, and explain with subject tools for formulas, powers, and symbols. No pen tablet or expensive software required.</p>
        <div className="hero-actions"><a className="hero-cta" href="#subjects">Choose a subject <span aria-hidden="true">↓</span></a><span className="hero-note">Customize it · Download it · Open in your browser</span></div>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orb orb-main">∑</div><div className="orb orb-small">✳</div><span className="scribble scribble-a">E = mc²</span><span className="scribble scribble-b">∇ · B = 0</span></div>
        <div className="hero-index"><span>01</span> / OPEN · TEACH · DOWNLOAD</div>
      </section>
      <section className="demo-section" aria-labelledby="demo-title">
        <div className="section-head demo-heading"><div><span className="section-kicker">A QUICK WALKTHROUGH</span><h2 id="demo-title">See how it works.</h2></div><span className="section-count">EDUNOTE DEMO</span></div>
        <div className="demo-frame"><video controls playsInline preload="metadata" aria-label="EduNote whiteboard demonstration"><source src="/Edunote_demo.mp4" type="video/mp4" />Your browser does not support MP4 video playback.</video></div>
        <div className="demo-foot"><span></span></div>
      </section>
      <section className="benefits" aria-labelledby="benefits-title">
        <div className="benefits-heading"><span className="section-kicker">MADE FOR THE CLASSROOM</span><h2 id="benefits-title">Your ideas are the lesson.<br /><span>The tools should stay simple.</span></h2><p>Start with a subject workspace, make it yours, and teach from a browser.</p></div>
        <div className="benefit-grid">
          <article className="benefit-card"><span className="benefit-icon" aria-hidden="true">⌁</span><span className="benefit-number">01 / WRITE</span><h3>Use what you have</h3><p>Draw and annotate with a mouse or trackpad. You don’t need to buy a pen tablet.</p></article>
          <article className="benefit-card"><span className="benefit-icon" aria-hidden="true">∑</span><span className="benefit-number">02 / EXPLAIN</span><h3>Formulas, powers &amp; symbols</h3><p>Insert common subject formulas and mathematical symbols as you build your lesson.</p></article>
          <article className="benefit-card"><span className="benefit-icon" aria-hidden="true">↧</span><span className="benefit-number">03 / TAKE IT WITH YOU</span><h3>Customize and download</h3><p>Choose the formulas you want, download your whiteboard as HTML, and open it in a browser. No paid software needed.</p></article>
        </div>
      </section>
      <section className="subjects" id="subjects"><div className="section-head"><div><span className="section-kicker">THE LIBRARY</span><h2>Pick a subject.</h2></div><span className="section-count">{String(subjects.length).padStart(2, "0")} SUBJECTS</span></div>
        <div className="subject-grid">{subjects.map((subject, index) => <a className="subject-card" href={subject.href} key={subject.href}><div className="card-top"><span className="card-number">{String(index + 1).padStart(2, "0")} / SUBJECT</span><span className="card-arrow" aria-hidden="true">↗</span></div><div className="subject-symbol" aria-hidden="true">{subject.symbol}</div><h3>{subject.name}</h3><p>{subject.description}</p><span className="card-open">Open workspace <span aria-hidden="true">→</span></span></a>)}</div>
      </section>
      <footer className="home-footer"><a className="brand wordmark" href="/" aria-label="EduNote home">edunote</a><span>Built for curious minds.</span><a href="#subjects">Back to subjects ↑</a></footer>
    </main>
  );
}
