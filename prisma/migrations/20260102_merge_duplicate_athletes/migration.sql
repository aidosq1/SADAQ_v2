-- Миграция для объединения дубликатов атлетов
-- Выполняется вручную с проверкой на продакшне

-- Шаг 1: Создать временную таблицу для маппинга дубликатов
CREATE TEMP TABLE athlete_duplicates AS
SELECT
    name,
    MIN(id) as primary_id,
    array_agg(id ORDER BY id) as all_ids
FROM "Athlete"
GROUP BY name
HAVING COUNT(*) > 1;

-- Шаг 2: Перенести рейтинги на главного атлета
UPDATE "RankingEntry" r
SET "athleteId" = d.primary_id
FROM athlete_duplicates d
WHERE r."athleteId" = ANY(d.all_ids)
AND r."athleteId" != d.primary_id
AND NOT EXISTS (
    SELECT 1 FROM "RankingEntry" r2
    WHERE r2."athleteId" = d.primary_id
    AND r2.category = r.category
    AND r2.gender = r.gender
    AND r2.type = r.type
);

-- Шаг 3: Удалить дубликаты рейтингов
DELETE FROM "RankingEntry" r
USING athlete_duplicates d
WHERE r."athleteId" = ANY(d.all_ids)
AND r."athleteId" != d.primary_id;

-- Шаг 4: Перенести результаты турниров
UPDATE "TournamentResult" t
SET "athleteId" = d.primary_id
FROM athlete_duplicates d
WHERE t."athleteId" = ANY(d.all_ids)
AND t."athleteId" != d.primary_id
AND NOT EXISTS (
    SELECT 1 FROM "TournamentResult" t2
    WHERE t2."athleteId" = d.primary_id
    AND t2."tournamentCategoryId" = t."tournamentCategoryId"
);

-- Шаг 5: Удалить дубликаты результатов
DELETE FROM "TournamentResult" t
USING athlete_duplicates d
WHERE t."athleteId" = ANY(d.all_ids)
AND t."athleteId" != d.primary_id;

-- Шаг 6: Перенести членство в сборной
UPDATE "NationalTeamMembership" n
SET "athleteId" = d.primary_id
FROM athlete_duplicates d
WHERE n."athleteId" = ANY(d.all_ids)
AND n."athleteId" != d.primary_id
AND NOT EXISTS (
    SELECT 1 FROM "NationalTeamMembership" n2
    WHERE n2."athleteId" = d.primary_id
    AND n2.category = n.category
    AND n2.gender = n.gender
    AND n2.type = n.type
);

-- Шаг 7: Удалить дубликаты членства
DELETE FROM "NationalTeamMembership" n
USING athlete_duplicates d
WHERE n."athleteId" = ANY(d.all_ids)
AND n."athleteId" != d.primary_id;

-- Шаг 8: Перенести регистрации
UPDATE "AthleteRegistration" a
SET "athleteId" = d.primary_id
FROM athlete_duplicates d
WHERE a."athleteId" = ANY(d.all_ids)
AND a."athleteId" != d.primary_id
AND NOT EXISTS (
    SELECT 1 FROM "AthleteRegistration" a2
    WHERE a2."athleteId" = d.primary_id
    AND a2."registrationId" = a."registrationId"
);

-- Шаг 9: Удалить дубликаты регистраций
DELETE FROM "AthleteRegistration" a
USING athlete_duplicates d
WHERE a."athleteId" = ANY(d.all_ids)
AND a."athleteId" != d.primary_id;

-- Шаг 10: Удалить дубликаты атлетов
DELETE FROM "Athlete" a
USING athlete_duplicates d
WHERE a.id = ANY(d.all_ids)
AND a.id != d.primary_id;

-- Шаг 11: Обновить slug (убрать category/type)
-- Это нужно делать отдельным скриптом с транслитерацией

DROP TABLE athlete_duplicates;
