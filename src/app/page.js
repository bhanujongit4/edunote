import ThemeToggle from "./theme-toggle";

const subjects = [{ name: "Physics", href: "/physics", detail: "A focused workspace for lessons, diagrams, and equations." }];

export default function Home() {
  return (
    <main className="home-shell">
      <nav className="home-nav" aria-label="Main navigation"><a className="brand" href="/" aria-label="EduNote home"><span className="brand-mark">e</span> edunote</a><div className="nav-actions"><a className="nav-link" href="#subjects">Subjects <span aria-hidden="true">↓</span></a><ThemeToggle /></div></nav>
      <section className="hero">
        <div className="eyebrow"><span className="status-dot" /> YOUR SPACE TO THINK CLEARLY</div>
        <h1>Make room for<br /><span>big ideas.</span></h1>
        <p className="hero-copy">A calm, focused place to learn, connect ideas, and make your thinking visible.</p>
        <a className="hero-cta" href="#subjects">Explore subjects <span aria-hidden="true">↓</span></a>
        <div className="hero-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="orb orb-main">∑</div><div className="orb orb-small">✳</div><span className="scribble scribble-a">E = mc²</span><span className="scribble scribble-b">∇ · B = 0</span></div>
        <div className="hero-index"><span>01</span> / LEARN AT YOUR PACE</div>
      </section>
      <section className="subjects" id="subjects"><div className="section-head"><div><span className="section-kicker">THE LIBRARY</span><h2>Pick a subject.</h2></div><span className="section-count">01 SUBJECT</span></div>
        <div className="subject-grid">{subjects.map((subject, index) => <a className="subject-card" href={subject.href} key={subject.href}><div className="card-top"><span className="card-number">0{index + 1} / SUBJECT</span><span className="card-arrow" aria-hidden="true">↗</span></div><div className="subject-symbol" aria-hidden="true">ϕ</div><h3>{subject.name}</h3><p>{subject.detail}</p><span className="card-open">Open workspace <span aria-hidden="true">→</span></span></a>)}</div>
      </section>
      <footer className="home-footer"><a className="brand" href="/"><span className="brand-mark">e</span> edunote</a><span>Built for curious minds.</span><a href="#subjects">Back to subjects ↑</a></footer>
    </main>
  );
}
