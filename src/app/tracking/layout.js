import Link from "next/link";
import ThemeToggle from "../theme-toggle";

export default function TrackingLayout({ children }) {
  return <div className="home-shell"><nav className="home-nav"><Link className="brand wordmark" href="/">Edunote</Link><div className="nav-actions"><Link className="nav-link" href="/tests">Tests</Link><Link className="nav-link" href="/tests/create">Create</Link><Link className="nav-link" href="/tracking">Tracking</Link><ThemeToggle /></div></nav>{children}<footer className="home-footer"><Link className="brand wordmark" href="/">edunote</Link><span>Practice, learn, improve.</span><Link href="/">Back home ↑</Link></footer></div>;
}
