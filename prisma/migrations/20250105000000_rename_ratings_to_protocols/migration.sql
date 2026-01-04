-- Rename "Рейтинги и Протоколы" to "Протоколы" in all languages
UPDATE "Translation"
SET
  ru = 'Протоколы',
  kk = 'Хаттамалар',
  en = 'Protocols'
WHERE namespace = 'DocumentsPage' AND key = 'sec_ratings';
