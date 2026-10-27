"use client";

import { useEffect, useRef, useState } from "react";

export default function AccessGate({ children, password, storageKey, promptMessage }) {
  const [allowed, setAllowed] = useState(false);
  const [denied, setDenied] = useState(false);
  const prompted = useRef(false);

  function requestAccess() {
    const entered = window.prompt(promptMessage);
    if (entered === password) {
      window.sessionStorage.setItem(storageKey, "granted");
      setAllowed(true);
      setDenied(false);
    } else {
      setDenied(true);
    }
  }

  useEffect(() => {
    if (prompted.current) return;
    prompted.current = true;
    if (window.sessionStorage.getItem(storageKey) === "granted") {
      setAllowed(true);
      return;
    }
    requestAccess();
  }, [password, promptMessage, storageKey]);

  if (allowed) return children;
  return <main className="exam-shell access-denied"><span className="section-kicker">EDUNOTE · RESTRICTED</span><h1>Access required.</h1><p>{denied ? "That password did not match." : "Enter the password to continue."}</p><button className="primary-button" type="button" onClick={requestAccess}>Try again <span>→</span></button></main>;
}
