import type { Locale } from '../i18n/locales';

// meta description разделов сайта: сниппет в Google и Яндексе
export const PAGE_DESCRIPTIONS: Record<string, Record<Locale, string>> = {
  '/': {
    ru: 'Официальный сайт Национальной федерации стрельбы из лука Республики Казахстан: новости, календарь турниров, рейтинг спортсменов и национальная сборная.',
    kk: 'Қазақстан Республикасы Ұлттық садақ ату федерациясының ресми сайты: жаңалықтар, жарыстар күнтізбесі, спортшылар рейтингі және ұлттық құрама.',
    en: 'Official website of the National Archery Federation of the Republic of Kazakhstan: news, competition calendar, athlete rankings and the national team.',
  },
  '/about': {
    ru: 'О Национальной федерации стрельбы из лука Казахстана: миссия, история, руководство и региональные федерации.',
    kk: 'Қазақстанның Ұлттық садақ ату федерациясы туралы: миссиясы, тарихы, басшылығы және өңірлік федерациялар.',
    en: 'About the National Archery Federation of the Republic of Kazakhstan: mission, history, leadership and regional federations.',
  },
  '/about/history': {
    ru: 'История стрельбы из лука в Казахстане и развитие Национальной федерации.',
    kk: 'Қазақстандағы садақ ату тарихы және Ұлттық федерацияның дамуы.',
    en: 'The history of archery in Kazakhstan and the development of the National Federation.',
  },
  '/about/leadership': {
    ru: 'Руководство Национальной федерации стрельбы из лука Республики Казахстан.',
    kk: 'Қазақстан Республикасы Ұлттық садақ ату федерациясының басшылығы.',
    en: 'Leadership of the National Archery Federation of the Republic of Kazakhstan.',
  },
  '/about/regions': {
    ru: 'Региональные федерации стрельбы из лука Казахстана: представители и контакты в областях и городах.',
    kk: 'Қазақстанның өңірлік садақ ату федерациялары: облыстар мен қалалардағы өкілдер және байланыс.',
    en: 'Regional archery federations of Kazakhstan: representatives and contacts in regions and cities.',
  },
  '/calendar': {
    ru: 'Календарь соревнований по стрельбе из лука в Казахстане: даты, места проведения и регистрация на турниры.',
    kk: 'Қазақстандағы садақ ату жарыстарының күнтізбесі: өтетін күні, орны және турнирлерге тіркелу.',
    en: 'Archery competition calendar in Kazakhstan: dates, venues and tournament registration.',
  },
  '/ranking': {
    ru: 'Национальный рейтинг спортсменов по стрельбе из лука: классический и блочный лук, мужчины и женщины, все возрастные категории.',
    kk: 'Садақ атудан спортшылардың ұлттық рейтингі: классикалық және блоктық садақ, ерлер мен әйелдер, барлық жас санаттары.',
    en: 'National archery rankings of Kazakhstan: recurve and compound, men and women, all age categories.',
  },
  '/results': {
    ru: 'Результаты соревнований по стрельбе из лука в Казахстане и протоколы турниров.',
    kk: 'Қазақстандағы садақ ату жарыстарының нәтижелері және турнир хаттамалары.',
    en: 'Archery competition results and official tournament result sheets in Kazakhstan.',
  },
  '/team': {
    ru: 'Национальная сборная Казахстана по стрельбе из лука: состав по возрастным категориям и дисциплинам.',
    kk: 'Қазақстанның садақ атудан ұлттық құрамасы: жас санаттары мен пәндер бойынша құрамы.',
    en: 'Kazakhstan national archery team: roster by age category and discipline.',
  },
  '/documents': {
    ru: 'Документы Федерации: положения о соревнованиях, правила, приказы и нормативные акты.',
    kk: 'Федерация құжаттары: жарыстар туралы ережелер, қағидалар, бұйрықтар және нормативтік актілер.',
    en: 'Federation documents: competition regulations, rules, orders and other regulatory documents.',
  },
  '/media/news': {
    ru: 'Новости стрельбы из лука в Казахстане: национальная сборная, турниры, регионы и события Федерации.',
    kk: 'Қазақстандағы садақ ату жаңалықтары: ұлттық құрама, турнирлер, өңірлер және федерация оқиғалары.',
    en: 'Archery news from Kazakhstan: national team, tournaments, regions and federation events.',
  },
  '/media/gallery': {
    ru: 'Фото и видео с соревнований и мероприятий Национальной федерации стрельбы из лука.',
    kk: 'Ұлттық садақ ату федерациясының жарыстары мен іс-шараларынан фото және бейне.',
    en: 'Photos and videos from competitions and events of the National Archery Federation.',
  },
};
