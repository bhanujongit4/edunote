export const SUBJECT_DOCUMENTS = {
  physics: {
    name: "Physics",
    htmlPath: "/physics-board.html",
    description: "A focused workspace for lessons, diagrams, and equations.",
    symbol: "ϕ",
  },
  chemistry: {
    name: "Chemistry",
    htmlPath: "/chemistry-board.html",
    description: "Explore reactions, structures, and the building blocks of matter.",
    symbol: "⚗",
  },
  maths: {
    name: "Maths",
    htmlPath: "/math-board.html",
    description: "Work through patterns, proofs, and mathematical ideas.",
    symbol: "π",
  },
};

function locateFormulaObject(html) {
  const assignment = /\bFORM\s*=\s*/.exec(html);
  if (!assignment) return null;

  const start = assignment.index + assignment[0].length;
  let depth = 0;
  let quote = "";
  let escaped = false;
  for (let index = start; index < html.length; index += 1) {
    const character = html[index];
    if (quote) {
      if (escaped) escaped = false;
      else if (character === "\\") escaped = true;
      else if (character === quote) quote = "";
      continue;
    }
    if (character === "'" || character === '"') quote = character;
    else if (character === "{") depth += 1;
    else if (character === "}" && --depth === 0) return { start, end: index + 1 };
  }
  return null;
}

function decodeJsString(token) {
  const quote = token[0];
  const body = token.slice(1, -1);
  if (quote === '"') return JSON.parse(token);

  return body.replace(/\\(u[\da-fA-F]{4}|x[\da-fA-F]{2}|.)/gs, (_, escape) => {
    if (escape[0] === "u") return String.fromCharCode(parseInt(escape.slice(1), 16));
    if (escape[0] === "x") return String.fromCharCode(parseInt(escape.slice(1), 16));
    return ({ n: "\n", r: "\r", t: "\t", b: "\b", f: "\f", v: "\v", "0": "\0" })[escape] ?? escape;
  });
}

export function parseFormulaObject(html) {
  const range = locateFormulaObject(html);
  if (!range) throw new Error("Could not find a FORM object in this subject HTML.");

  const tokens = html.slice(range.start, range.end).match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[{}\[\]:,]|[^\s{}\[\]:,]+/g) ?? [];
  let index = 0;
  const peek = () => tokens[index];
  const take = (expected) => {
    const value = tokens[index++];
    if (expected && value !== expected) throw new Error(`Expected ${expected} in FORM data.`);
    return value;
  };
  const string = () => {
    const token = take();
    if (!token || !["'", '"'].includes(token[0])) throw new Error("FORM keys and formulas must be quoted strings.");
    return decodeJsString(token);
  };

  take("{");
  const form = {};
  while (peek() !== "}") {
    const category = string();
    take(":");
    take("[");
    const formulas = [];
    while (peek() !== "]") {
      formulas.push(string());
      if (peek() === ",") take(",");
      else if (peek() !== "]") throw new Error("Expected a comma between formulas.");
    }
    take("]");
    form[category] = formulas;
    if (peek() === ",") take(",");
    else if (peek() !== "}") throw new Error("Expected a comma between formula categories.");
  }
  take("}");
  return form;
}

export function replaceFormulaObject(html, form) {
  const range = locateFormulaObject(html);
  if (!range) throw new Error("Could not find a replaceable FORM object in this subject HTML.");
  return (html.slice(0, range.start) + JSON.stringify(form, null, 2) + html.slice(range.end))
    .replace(/\s*<a\b(?=[^>]*\bid=["']customizeLink["'])[^>]*>[\s\S]*?<\/a>/i, "");
}
