/** Общий вид строки для сравнения: регистр, ё/е и лишняя пунктуация не мешают. */
export function normalize(value: string): string {
  return value
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[^a-z0-9а-я+#./\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Ищет термин как отдельное слово, чтобы «java» не сработало внутри «javascript». */
export function containsTerm(text: string, term: string): boolean {
  if (!term) return false;

  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const pattern = new RegExp(
    `(^|[^a-z0-9а-я+#])${escaped}(?=$|[^a-z0-9а-я+#])`,
    "i",
  );

  return pattern.test(text);
}
