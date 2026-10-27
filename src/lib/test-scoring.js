export function scoreNeetAttempt(questions, answers) {
  const score = questions.reduce((total, question, index) => {
    const selected = Number(answers?.[index]);
    if (!Number.isInteger(selected) || selected < 0 || selected >= question.options.length) return total;
    return total + (selected === Number(question.correctIndex) ? 4 : -1);
  }, 0);
  return { score, total: questions.length * 4 };
}
