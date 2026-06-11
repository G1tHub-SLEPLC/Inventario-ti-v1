export function cleanTokens(name) {
  if (!name) return [];
  const normalized = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const words = normalized.split(/\s+/);
  const stopWords = ['de', 'del', 'la', 'las', 'los', 'y', 'el', 'en', 'slep', 'sin', 'asignar', 'disponible', 'bodega', '—', '-'];
  return words.filter(w => w.length > 2 && !stopWords.includes(w));
}

export function isSameUser(name1, name2) {
  if (!name1 || !name2) return false;
  const tokens1 = cleanTokens(name1);
  const tokens2 = cleanTokens(name2);
  
  if (tokens1.length === 0 || tokens2.length === 0) return false;
  
  const matches = tokens1.filter(t => tokens2.includes(t));
  
  if (matches.length >= 2) return true;
  if ((tokens1.length === 1 || tokens2.length === 1) && matches.length >= 1) return true;
  
  return false;
}
