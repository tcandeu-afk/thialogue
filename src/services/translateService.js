/**
 * Built-in Google Translate & Dictionary service for translating and looking up words/sentences
 * across French (fr), Italian (it), Korean (ko), Japanese (ja), Spanish (es), Thai (th), and English (en).
 */
export async function translateToEnglish(text, sourceLang = 'auto') {
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return { translatedText: '', detectedSourceLang: sourceLang };
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sourceLang
  )}&tl=en&dt=t&q=${encodeURIComponent(trimmed)}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Google Translate request failed (HTTP ${response.status})`);
  }

  const data = await response.json();
  const segments = Array.isArray(data?.[0]) ? data[0] : [];
  const translatedText = segments
    .map((segment) => (Array.isArray(segment) ? segment[0] : ''))
    .join('');

  const detectedSourceLang = data?.[2] || sourceLang;

  return {
    translatedText: translatedText || trimmed,
    detectedSourceLang,
  };
}

/**
 * Rich Dictionary & Phrase Lookup using Google Translate's dictionary (`dt=bd`) and
 * phonetic transliteration (`dt=rm`) endpoints. Supports both TargetLang -> English
 * and English -> TargetLang lookups!
 */
export async function lookupDictionaryWordOrPhrase({
  query,
  sourceLang = 'fr',
  targetLang = 'en',
}) {
  const trimmed = (query || '').trim();
  if (!trimmed) {
    return null;
  }

  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${encodeURIComponent(
    sourceLang
  )}&tl=${encodeURIComponent(targetLang)}&dt=t&dt=bd&dt=rm&q=${encodeURIComponent(
    trimmed
  )}`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Dictionary lookup failed (HTTP ${response.status})`);
  }

  const data = await response.json();

  // 1. Primary translation (data[0])
  const segments = Array.isArray(data?.[0]) ? data[0] : [];
  const primaryTranslation = segments
    .filter((seg) => Array.isArray(seg) && typeof seg[0] === 'string')
    .map((seg) => seg[0])
    .join('');

  // 2. Phonetic reading / transliteration (often in the last element of data[0])
  let phonetic = null;
  for (const seg of segments) {
    if (Array.isArray(seg) && (seg[3] || seg[2])) {
      phonetic = seg[3] || seg[2];
    }
  }

  // 3. Dictionary parts of speech & alternative meanings (data[1])
  const dictionaryEntries = [];
  if (Array.isArray(data?.[1])) {
    data[1].forEach((posBlock) => {
      const partOfSpeech = posBlock?.[0] || 'term';
      const terms = Array.isArray(posBlock?.[1]) ? posBlock[1].slice(0, 5) : [];
      const detailedRows = Array.isArray(posBlock?.[2])
        ? posBlock[2].slice(0, 4).map((row) => ({
            word: row?.[0] || '',
            reverseTranslations: Array.isArray(row?.[1]) ? row[1].slice(0, 3) : [],
          }))
        : [];
      dictionaryEntries.push({
        partOfSpeech,
        terms,
        detailedRows,
      });
    });
  }

  return {
    query: trimmed,
    sourceLang,
    targetLang,
    primaryTranslation: primaryTranslation || trimmed,
    phonetic,
    dictionaryEntries,
  };
}

export function buildGoogleTranslateWebUrl(text, sourceLang = 'auto', targetLang = 'en') {
  return `https://translate.google.com/?sl=${encodeURIComponent(
    sourceLang
  )}&tl=${encodeURIComponent(targetLang)}&text=${encodeURIComponent(
    text || ''
  )}&op=translate`;
}
