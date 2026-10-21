-- Вкладки календаря: будущие и прошедшие соревнования
INSERT INTO "Translation" ("namespace", "key", "ru", "kk", "en", "updatedAt") VALUES
    ('CalendarPage', 'tab_upcoming', 'Предстоящие', 'Алдағы', 'Upcoming', CURRENT_TIMESTAMP),
    ('CalendarPage', 'tab_past', 'Прошедшие', 'Өткен', 'Past', CURRENT_TIMESTAMP),
    ('CalendarPage', 'no_upcoming', 'Предстоящих соревнований нет', 'Алдағы жарыстар жоқ', 'No upcoming events', CURRENT_TIMESTAMP)
ON CONFLICT ("namespace", "key") DO NOTHING;
