export const SUBJECT_DOCUMENTS = {
  physics: {
    name: "Physics",
    htmlPath: "/physics-board.html",
  },
};

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
  const declaration = html.match(/\bconst\s+FORM\s*=\s*(\{[\s\S]*?\n\s*\});/);
  if (!declaration) throw new Error("Could not find a const FORM object in this subject HTML.");

  const tokens = declaration[1].match(/"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[{}\[\]:,]|[^\s{}\[\]:,]+/g) ?? [];
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
  const declaration = /\bconst\s+FORM\s*=\s*\{[\s\S]*?\n\s*\};/;
  if (!declaration.test(html)) throw new Error("Could not find a replaceable const FORM object in this subject HTML.");
  return html.replace(declaration, `const FORM=${JSON.stringify(form, null, 2)};`);
}
