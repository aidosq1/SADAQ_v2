-- Подвал рендерится на сервере с запасными ключами Footer.email / Footer.phone, пока не загрузится SiteContent.
-- В них были заглушки: поисковики и первый кадр страницы показывали чужие контакты. Ставим настоящие, как в SiteContent.
UPDATE "Translation" SET "ru" = 'archery.kaz@gmail.com', "kk" = 'archery.kaz@gmail.com', "en" = 'archery.kaz@gmail.com', "updatedAt" = CURRENT_TIMESTAMP
WHERE "namespace" = 'Footer' AND "key" = 'email' AND "ru" = 'info@archery.kz';

UPDATE "Translation" SET "ru" = '+7 705 663 99 55', "kk" = '+7 705 663 99 55', "en" = '+7 705 663 99 55', "updatedAt" = CURRENT_TIMESTAMP
WHERE "namespace" = 'Footer' AND "key" = 'phone' AND "ru" = '+7 (7172) 123-45-67';
