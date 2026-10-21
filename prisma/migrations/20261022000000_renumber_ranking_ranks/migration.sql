-- Закрываем пропуски в поле rank (лидер был с rank = 2, у части групп номера сбиты).
-- Порядок внутри группы не меняется: активные спортсмены получают 1..N
-- в прежнем порядке (rank, затем очки), неактивные идут после них.
WITH ordered AS (
    SELECT r."id",
           ROW_NUMBER() OVER (
               PARTITION BY r."category", r."gender", r."type"
               ORDER BY a."isActive" DESC, r."rank" ASC, r."points" DESC, r."id" ASC
           ) AS new_rank
    FROM "RankingEntry" r
    JOIN "Athlete" a ON a."id" = r."athleteId"
)
UPDATE "RankingEntry" r
SET "rank" = ordered.new_rank
FROM ordered
WHERE r."id" = ordered."id" AND r."rank" <> ordered.new_rank;
