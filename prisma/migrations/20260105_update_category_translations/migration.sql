-- Update age category translations in Translation table
-- CalendarPage translations
UPDATE "Translation" SET
    "ru" = 'Юниор',
    "kk" = 'Юниор',
    "en" = 'Junior'
WHERE "namespace" = 'CalendarPage' AND "key" = 'age_juniors';

UPDATE "Translation" SET
    "ru" = 'Юноша',
    "kk" = 'Жасөспірім',
    "en" = 'U18'
WHERE "namespace" = 'CalendarPage' AND "key" = 'age_cadets';

UPDATE "Translation" SET
    "ru" = 'Молодёжь',
    "kk" = 'Жастар',
    "en" = 'Youth'
WHERE "namespace" = 'CalendarPage' AND "key" = 'age_youth';

UPDATE "Translation" SET
    "ru" = 'Младший юноша',
    "kk" = 'Кіші жасөспірім',
    "en" = 'U15'
WHERE "namespace" = 'CalendarPage' AND "key" = 'age_cubs';

-- RankingPage translations
UPDATE "Translation" SET
    "ru" = 'Юниор',
    "kk" = 'Юниор',
    "en" = 'Junior'
WHERE "namespace" = 'RankingPage' AND "key" = 'age_juniors';

UPDATE "Translation" SET
    "ru" = 'Юноша',
    "kk" = 'Жасөспірім',
    "en" = 'U18'
WHERE "namespace" = 'RankingPage' AND "key" = 'age_cadets';

UPDATE "Translation" SET
    "ru" = 'Младший юноша',
    "kk" = 'Кіші жасөспірім',
    "en" = 'U15'
WHERE "namespace" = 'RankingPage' AND "key" = 'age_cubs';
