export function highlightSearch(text: string, search: string) {
  if (!search) return text;
  const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(safeSearch, "gi");
  return text.replace(regex, (match) => `<mark>${match}</mark>`);
}
