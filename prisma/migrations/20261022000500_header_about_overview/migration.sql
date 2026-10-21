-- Пункт меню /about назывался как сама группа «О Федерации»: в меню было два одинаковых пункта
INSERT INTO "Translation" ("namespace", "key", "ru", "kk", "en", "updatedAt") VALUES
    ('Header', 'about_overview', 'Общая информация', 'Жалпы ақпарат', 'Overview', CURRENT_TIMESTAMP)
ON CONFLICT ("namespace", "key") DO NOTHING;
