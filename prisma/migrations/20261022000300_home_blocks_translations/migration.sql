-- Подписи главной и шапки были зашиты в код тернарниками по языку
INSERT INTO "Translation" ("namespace", "key", "ru", "kk", "en", "updatedAt") VALUES
    ('Header', 'logo_country', 'Республики Казахстан', 'Қазақстан Республикасының', 'Republic of Kazakhstan', CURRENT_TIMESTAMP),
    ('Header', 'logo_name', 'Национальная Федерация Стрельбы из Лука', 'Ұлттық Садақ Ату Федерациясы', 'National Archery Federation', CURRENT_TIMESTAMP),
    ('NewsPage', 'all_news', 'Все новости', 'Барлық жаңалықтар', 'All News', CURRENT_TIMESTAMP),
    ('RankingPage', 'leaders_title', 'Лидеры рейтинга', 'Рейтинг көшбасшылары', 'Ranking Leaders', CURRENT_TIMESTAMP),
    ('RankingPage', 'full_ranking', 'Полный рейтинг', 'Толық рейтинг', 'Full Rankings', CURRENT_TIMESTAMP),
    ('PartnersBlock', 'general_title', 'Генеральный партнёр', 'Бас серіктес', 'General Partner', CURRENT_TIMESTAMP)
ON CONFLICT ("namespace", "key") DO NOTHING;
