"use client";

import { useEffect, useRef, useState } from "react";

export default function AccessGate({ children, scope, promptMessage }) {
  const [allowed, setAllowed] = useState(false);
  const [denied, setDenied] = useState(false);
  const [checking, setChecking] = useState(true);
  const prompted = useRef(false);

  async function requestAccess() {
    setChecking(true);
    const entered = window.prompt(promptMessage);
    if (entered === null) { setDenied(true); setChecking(false); return; }
    try {
      const response = await fetch("/api/access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope, password: entered }),
      });
      if (!response.ok) throw new Error("Password did not match.");
      setAllowed(true);
      setDenied(false);
    } catch {
      setDenied(true);
    } finally {
      setChecking(false);
    }
  }

  useEffect(() => {
    if (prompted.current) return;
    prompted.current = true;
    fetch(`/api/access?scope=${encodeURIComponent(scope)}`).then((response) => response.json()).then(async (data) => {
      if (data.authorized) setAllowed(true);
      else await requestAccess();
    }).catch(async () => await requestAccess()).finally(() => setChecking(false));
  }, [scope, promptMessage]);

  if (allowed) return children;
  return <main className="exam-shell access-denied"><span className="section-kicker">EDUNOTE · RESTRICTED</span><h1>Access required.</h1><p>{checking ? "Checking access…" : denied ? "Password was incorrect or access was cancelled." : "Enter the password to continue."}</p>{!checking && <button className="primary-button" type="button" onClick={requestAccess}>Try again <span>→</span></button>}</main>;
}
