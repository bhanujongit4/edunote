"use client";

import { useState } from "react";

export default function QuestionImage({ src, alt, className = "question-preview" }) {
  const [mode, setMode] = useState("direct");
  const [failureMessage, setFailureMessage] = useState("");
  if (!src?.trim()) return null;
  const imageUrl = `/api/question-image?url=${encodeURIComponent(src.trim())}`;
  async function reportProxyFailure() {
    setMode("error");
    try {
      const response = await fetch(imageUrl);
      const result = await response.json();
      if (result.error) setFailureMessage(result.error);
    } catch { setFailureMessage("Check that the URL points to a public image, or try a direct image URL."); }
  }
  if (mode === "error") return <p className="image-load-error" role="status">Image couldn’t load. {failureMessage || "Check that the URL points to a public image, or try a direct image URL."}</p>;
  return <img className={className} src={mode === "direct" ? src.trim() : imageUrl} alt={alt} referrerPolicy="no-referrer" onError={() => mode === "direct" ? setMode("proxy") : reportProxyFailure()} />;
}
