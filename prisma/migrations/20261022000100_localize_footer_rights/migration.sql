-- Копирайт в футере был на английском во всех языках
UPDATE "Translation" SET
    "ru" = 'Национальная федерация стрельбы из лука Республики Казахстан. Все права защищены.',
    "kk" = 'Қазақстан Республикасының Ұлттық садақ ату федерациясы. Барлық құқықтар қорғалған.',
    "en" = 'National Archery Federation of the Republic of Kazakhstan. All rights reserved.'
WHERE "namespace" = 'Footer' AND "key" = 'rights';
