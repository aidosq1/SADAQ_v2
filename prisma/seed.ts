import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { TEAM_MEMBERS_DATA_2026, RANKINGS_DATA_2026 } from './ranking2026';

const prisma = new PrismaClient();

// Region keys matching messages/*.json Regions section for proper localization
const REGIONS = [
  "astana", "almaty", "shymkent",
  "abai", "akmola", "aktobe", "almaty_reg", "atyrau",
  "west_kaz", "jambyl", "zhetysu", "karaganda",
  "kostanay", "kyzylorda", "mangystau", "pavlodar",
  "north_kaz", "turkistan", "ulytau", "east_kaz"
];

// News data from NewsBlock.tsx
const NEWS_DATA = [
  {
    slug: "kazakh-archers-3-gold-asian-cup",
    title: "Казахстанские лучники завоевали 3 золота на Кубке Азии",
    titleKk: "Қазақстандық садақшылар Азия кубогында 3 алтын алды",
    titleEn: "Kazakh archers win 3 gold medals at Asian Cup",
    content: "Национальная сборная Казахстана по стрельбе из лука показала отличные результаты на Кубке Азии, завоевав три золотые медали в различных дисциплинах. Это значительный успех для казахстанского лучного спорта.",
    contentKk: "Қазақстан Республикасының садақ атудан ұлттық құрамасы Азия кубогында тамаша нәтижелер көрсетіп, әртүрлі пәндерде үш алтын медаль жеңіп алды.",
    contentEn: "The national archery team of Kazakhstan showed excellent results at the Asian Cup, winning three gold medals in various disciplines.",
    excerpt: "Национальная сборная показала отличные результаты на международных соревнованиях.",
    category: "Сборная",
    image: "/slides/archer_tokyo.png",
    showInSlider: true,
    sliderOrder: 0,
    updatedAt: new Date(),
  },
  {
    slug: "registration-open-indoor-championship",
    title: "Открыта регистрация на Чемпионат РК в закрытых помещениях",
    titleKk: "Жабық үй-жайларда өтетін ҚР чемпионатына тіркеу ашылды",
    titleEn: "Registration open for Indoor Championship of Kazakhstan",
    content: "Федерация стрельбы из лука объявляет об открытии регистрации на Чемпионат Республики Казахстан в закрытых помещениях.",
    contentKk: "Садақ ату федерациясы Қазақстан Республикасының жабық үй-жайлардағы чемпионатына тіркеудің ашылғанын хабарлайды.",
    contentEn: "The Archery Federation announces the opening of registration for the Indoor Championship of the Republic of Kazakhstan.",
    category: "Регионы",
    image: "/slides/slide3.jpg",
    showInSlider: false,
    sliderOrder: 0,
    updatedAt: new Date(),
  },
  {
    slug: "world-archery-olympic-qualification",
    title: "World Archery обновил правила квалификации на Олимпиаду",
    titleKk: "World Archery Олимпиадаға іріктеу ережелерін жаңартты",
    titleEn: "World Archery updates Olympic qualification rules",
    content: "Международная федерация стрельбы из лука (World Archery) объявила об изменениях в правилах квалификации на Олимпийские игры.",
    contentKk: "Халықаралық садақ ату федерациясы (World Archery) Олимпиада ойындарына іріктеу ережелеріндегі өзгерістер туралы хабарлады.",
    contentEn: "The World Archery Federation has announced changes to the qualification rules for the Olympic Games.",
    category: "World Archery",
    image: "/slides/slide2.jpg",
    showInSlider: false,
    sliderOrder: 0,
    updatedAt: new Date(),
  },
  {
    slug: "independence-day-congratulations",
    title: "Поздравляем с Днём Независимости Республики Казахстан!",
    titleKk: "Қазақстан Республикасының Тәуелсіздік күнімен құттықтаймыз!",
    titleEn: "Congratulations on the Independence Day of the Republic of Kazakhstan!",
    content: "Федерация стрельбы из лука поздравляет всех казахстанцев с Днём Независимости!",
    contentKk: "Садақ ату федерациясы барлық қазақстандықтарды Тәуелсіздік күнімен құттықтайды!",
    contentEn: "The Archery Federation congratulates all Kazakhstanis on Independence Day!",
    category: "Праздники",
    image: "/slides/archer_tokyo.png",
    showInSlider: false,
    sliderOrder: 0,
    updatedAt: new Date(),
  },
];

// Team members and rankings data imported from ranking2026.ts
// Contains 547 real athletes from the 2026 rating Excel file

// Partners data from PartnersBlock.tsx
const PARTNERS_DATA = [
  {
    name: "World Archery",
    logo: "/badges/world-archery.svg",
    websiteUrl: "https://worldarchery.sport",
    description: "Всемирная федерация стрельбы из лука",
    descriptionKk: "Дүниежүзілік садақ ату федерациясы",
    descriptionEn: "World Archery Federation",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Asian Archery Federation",
    logo: "/badges/asian-archery.svg",
    websiteUrl: "https://archery.sport",
    description: "Азиатская федерация стрельбы из лука",
    descriptionKk: "Азия садақ ату федерациясы",
    descriptionEn: "Asian Archery Federation",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Министерство туризма и спорта РК",
    logo: "/badges/ministry.svg",
    websiteUrl: "https://gov.kz/memleket/entities/mts",
    description: "Министерство туризма и спорта Республики Казахстан",
    descriptionKk: "Қазақстан Республикасының Туризм және спорт министрлігі",
    descriptionEn: "Ministry of Tourism and Sports of the Republic of Kazakhstan",
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "НОК Казахстана",
    logo: "/badges/noc.svg",
    websiteUrl: "https://olympic.kz",
    description: "Национальный Олимпийский комитет Республики Казахстан",
    descriptionKk: "Қазақстан Республикасының Ұлттық Олимпиада комитеті",
    descriptionEn: "National Olympic Committee of the Republic of Kazakhstan",
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "TWP",
    logo: null,
    websiteUrl: "https://twp.kz",
    description: "Партнёр федерации",
    descriptionKk: "Федерация серіктесі",
    descriptionEn: "Federation partner",
    sortOrder: 5,
    isActive: true,
  },
];

// Regional branches data from regions/page.tsx
const REGIONAL_BRANCHES_DATA = [
  {
    name: "Филиал г. Астана",
    nameKk: "Астана қаласы филиалы",
    nameEn: "Astana Branch",
    director: "Иванов Сергей Петрович",
    directorKk: "Иванов Сергей Петрович",
    directorEn: "Sergey Ivanov",
    address: "ул. Достык, 12, офис 45",
    addressKk: "Достық көшесі, 12, 45-кеңсе",
    addressEn: "12 Dostyk Street, office 45",
    phone: "+7 (7172) 55-55-55",
    email: "astana@archery.kz",
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Филиал г. Алматы",
    nameKk: "Алматы қаласы филиалы",
    nameEn: "Almaty Branch",
    director: "Касымов Нурлан Маратович",
    directorKk: "Қасымов Нұрлан Маратұлы",
    directorEn: "Nurlan Kasymov",
    address: "ул. Абая, 89",
    addressKk: "Абай көшесі, 89",
    addressEn: "89 Abay Street",
    phone: "+7 (727) 333-22-11",
    email: "almaty@archery.kz",
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Филиал г. Шымкент",
    nameKk: "Шымкент қаласы филиалы",
    nameEn: "Shymkent Branch",
    director: "Алиев Бауыржан Кайратович",
    directorKk: "Әлиев Бауыржан Қайратұлы",
    directorEn: "Bauyrzhan Aliev",
    address: "пр. Республики, 25",
    addressKk: "Республика даңғылы, 25",
    addressEn: "25 Republic Avenue",
    phone: "+7 (7252) 44-00-99",
    email: "shymkent@archery.kz",
    sortOrder: 3,
    isActive: true,
  },
];

// History events data from history/page.tsx
const HISTORY_EVENTS_DATA = [
  {
    year: "Бронзовый век",
    title: "Начало традиций",
    titleKk: "Дәстүрлердің бастауы",
    titleEn: "Beginning of traditions",
    description: "Первые свидетельства использования лука и стрел на территории Казахстана датируются бронзовым веком. Наши предки были искусными лучниками.",
    descriptionKk: "Қазақстан территориясында садақ пен жебені пайдаланудың алғашқы дәлелдері қола дәуірінен басталады. Біздің бабаларымыз шебер садақшылар болған.",
    descriptionEn: "The first evidence of the use of bow and arrows in Kazakhstan dates back to the Bronze Age. Our ancestors were skilled archers.",
    iconType: "scroll",
    sortOrder: 1,
    isActive: true,
  },
  {
    year: "1992",
    title: "Основание федерации",
    titleKk: "Федерацияның құрылуы",
    titleEn: "Federation founding",
    description: "После обретения независимости была официально создана Федерация стрельбы из лука Республики Казахстан.",
    descriptionKk: "Тәуелсіздік алғаннан кейін Қазақстан Республикасының садақ атудан федерациясы ресми түрде құрылды.",
    descriptionEn: "After gaining independence, the Archery Federation of the Republic of Kazakhstan was officially established.",
    iconType: "calendar",
    sortOrder: 2,
    isActive: true,
  },
  {
    year: "1996",
    title: "Первые международные успехи",
    titleKk: "Алғашқы халықаралық жетістіктер",
    titleEn: "First international successes",
    description: "Казахстанские лучники впервые приняли участие в Олимпийских играх в Атланте и показали достойные результаты.",
    descriptionKk: "Қазақстандық садақшылар алғаш рет Атлантадағы Олимпиада ойындарына қатысып, лайықты нәтижелер көрсетті.",
    descriptionEn: "Kazakh archers participated in the Olympic Games in Atlanta for the first time and showed worthy results.",
    iconType: "trophy",
    sortOrder: 3,
    isActive: true,
  },
  {
    year: "2004",
    title: "Развитие инфраструктуры",
    titleKk: "Инфрақұрылымның дамуы",
    titleEn: "Infrastructure development",
    description: "Открытие современных тренировочных центров в Алматы и Астане. Начало системной подготовки молодых спортсменов.",
    descriptionKk: "Алматы мен Астанада заманауи жаттығу орталықтарының ашылуы. Жас спортшыларды жүйелі даярлаудың басталуы.",
    descriptionEn: "Opening of modern training centers in Almaty and Astana. Beginning of systematic training for young athletes.",
    iconType: "target",
    sortOrder: 4,
    isActive: true,
  },
  {
    year: "2023-2024",
    title: "Новая эра",
    titleKk: "Жаңа дәуір",
    titleEn: "New era",
    description: "Активное развитие федерации: участие в международных соревнованиях, подготовка к Олимпиаде 2028, рост числа спортсменов.",
    descriptionKk: "Федерацияның белсенді дамуы: халықаралық жарыстарға қатысу, 2028 Олимпиадасына дайындық, спортшылар санының өсуі.",
    descriptionEn: "Active development of the federation: participation in international competitions, preparation for the 2028 Olympics, growing number of athletes.",
    iconType: "medal",
    sortOrder: 5,
    isActive: true,
  },
];

// Protocols data from results/page.tsx
const PROTOCOLS_DATA = [
  {
    title: "Кубок Республики Казахстан",
    titleKk: "Қазақстан Республикасының Кубогы",
    titleEn: "Cup of the Republic of Kazakhstan",
    eventDate: new Date('2024-12-15'),
    location: "Астана",
    locationKk: "Астана",
    locationEn: "Astana",
    fileUrl: null,
    year: 2024,
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Летний Чемпионат РК",
    titleKk: "ҚР Жазғы Чемпионаты",
    titleEn: "Summer Championship of RK",
    eventDate: new Date('2024-08-20'),
    location: "Алматы",
    locationKk: "Алматы",
    locationEn: "Almaty",
    fileUrl: null,
    year: 2024,
    sortOrder: 2,
    isPublished: true,
  },
  {
    title: "Турнир памяти А. Овчинникова",
    titleKk: "А. Овчинников атындағы турнир",
    titleEn: "A. Ovchinnikov Memorial Tournament",
    eventDate: new Date('2024-06-10'),
    location: "Темиртау",
    locationKk: "Теміртау",
    locationEn: "Temirtau",
    fileUrl: null,
    year: 2024,
    sortOrder: 3,
    isPublished: true,
  },
  {
    title: "Чемпионат РК в помещении",
    titleKk: "ҚР жабық үй-жайлардағы чемпионаты",
    titleEn: "Indoor Championship of RK",
    eventDate: new Date('2023-02-25'),
    location: "Шымкент",
    locationKk: "Шымкент",
    locationEn: "Shymkent",
    fileUrl: null,
    year: 2023,
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Спартакиада Народов",
    titleKk: "Халықтар Спартакиадасы",
    titleEn: "People's Spartakiad",
    eventDate: new Date('2023-09-20'),
    location: "Алматы",
    locationKk: "Алматы",
    locationEn: "Almaty",
    fileUrl: null,
    year: 2023,
    sortOrder: 2,
    isPublished: true,
  },
];

// Gallery items data from MediaBlock.tsx
const GALLERY_DATA = [
  {
    title: "Чемпионат Азии 2024",
    titleKk: "Азия чемпионаты 2024",
    titleEn: "Asian Championship 2024",
    description: "Финальные соревнования",
    descriptionKk: "Финалдық жарыстар",
    descriptionEn: "Final competitions",
    url: "/slides/archer_tokyo.png",
    type: "photo",
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Тренировочный процесс",
    titleKk: "Жаттығу үдерісі",
    titleEn: "Training process",
    description: "Подготовка к соревнованиям",
    descriptionKk: "Жарыстарға дайындық",
    descriptionEn: "Competition preparation",
    url: "/slides/archer_tokyo.png",
    type: "photo",
    sortOrder: 2,
    isPublished: true,
  },
  {
    title: "Молодые таланты",
    titleKk: "Жас таланттар",
    titleEn: "Young talents",
    description: "Будущее казахстанского лучного спорта",
    descriptionKk: "Қазақстандық садақ атудың болашағы",
    descriptionEn: "The future of Kazakh archery",
    url: "/slides/archer_tokyo.png",
    type: "photo",
    sortOrder: 3,
    isPublished: true,
  },
  {
    title: "Церемония награждения",
    titleKk: "Марапаттау рәсімі",
    titleEn: "Award ceremony",
    description: "Лучшие спортсмены 2024",
    descriptionKk: "2024 жылдың үздік спортшылары",
    descriptionEn: "Best athletes of 2024",
    url: "/slides/archer_tokyo.png",
    type: "photo",
    sortOrder: 4,
    isPublished: true,
  },
  {
    title: "Мастер-класс от чемпиона",
    titleKk: "Чемпионнан шеберлік сыныбы",
    titleEn: "Master class from champion",
    description: "Обучение новичков",
    descriptionKk: "Жаңадан бастаушыларды оқыту",
    descriptionEn: "Training beginners",
    url: "/slides/archer_tokyo.png",
    type: "photo",
    sortOrder: 5,
    isPublished: true,
  },
];

// Documents data
const DOCUMENTS_DATA = [
  // Statute section
  {
    title: "Устав Федерации (2025)",
    titleKk: "Федерация жарғысы (2025)",
    titleEn: "Federation Charter (2025)",
    section: "statute",
    fileUrl: "/documents/ustav_2025.pdf",
    fileType: "pdf",
    fileSize: 1250000,
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Свидетельство о регистрации",
    titleKk: "Тіркеу куәлігі",
    titleEn: "Registration Certificate",
    section: "statute",
    fileUrl: "/documents/registration.pdf",
    fileType: "pdf",
    fileSize: 350000,
    sortOrder: 2,
    isPublished: true,
  },
  // Rules section
  {
    title: "Правила соревнований World Archery (2024)",
    titleKk: "World Archery жарыс ережелері (2024)",
    titleEn: "World Archery Competition Rules (2024)",
    section: "rules",
    fileUrl: "/documents/wa_rules_2024.pdf",
    fileType: "pdf",
    fileSize: 5800000,
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Регламент Чемпионатов РК",
    titleKk: "ҚР Чемпионаттарының регламенті",
    titleEn: "RK Championship Regulations",
    section: "rules",
    fileUrl: "/documents/rk_regulations.pdf",
    fileType: "pdf",
    fileSize: 890000,
    sortOrder: 2,
    isPublished: true,
  },
  // Antidoping section
  {
    title: "Антидопинговый кодекс WADA",
    titleKk: "WADA допингке қарсы кодексі",
    titleEn: "WADA Anti-Doping Code",
    section: "antidoping",
    fileUrl: "/documents/wada_code.pdf",
    fileType: "pdf",
    fileSize: 2100000,
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Запрещенный список 2025",
    titleKk: "2025 жылғы тыйым салынған тізім",
    titleEn: "Prohibited List 2025",
    section: "antidoping",
    fileUrl: "/documents/prohibited_2025.pdf",
    fileType: "pdf",
    fileSize: 450000,
    sortOrder: 2,
    isPublished: true,
  },
  // Calendar section
  {
    title: "Единый республиканский календарный план 2025",
    titleKk: "2025 жылғы бірыңғай республикалық күнтізбелік жоспар",
    titleEn: "Unified Republican Calendar Plan 2025",
    section: "calendar",
    fileUrl: "/documents/calendar_2025.pdf",
    fileType: "pdf",
    fileSize: 780000,
    sortOrder: 1,
    isPublished: true,
  },
  // Ratings section
  {
    title: "Текущий рейтинг атлетов (Мужчины)",
    titleKk: "Спортшылардың ағымдағы рейтингі (Ерлер)",
    titleEn: "Current Athlete Rating (Men)",
    section: "ratings",
    fileUrl: "/documents/rating_men.pdf",
    fileType: "pdf",
    fileSize: 320000,
    sortOrder: 1,
    isPublished: true,
  },
  {
    title: "Текущий рейтинг атлетов (Женщины)",
    titleKk: "Спортшылардың ағымдағы рейтингі (Әйелдер)",
    titleEn: "Current Athlete Rating (Women)",
    section: "ratings",
    fileUrl: "/documents/rating_women.pdf",
    fileType: "pdf",
    fileSize: 310000,
    sortOrder: 2,
    isPublished: true,
  },
];

// Site content data (CMS texts)
const SITE_CONTENT_DATA = [
  // Hero section
  {
    key: "hero_title",
    section: "hero",
    value: "Национальная Федерация стрельбы из лука Республики Казахстан",
    valueKk: "Қазақстан Республикасының Ұлттық садақ ату федерациясы",
    valueEn: "National Archery Federation of the Republic of Kazakhstan",
  },
  {
    key: "hero_slogan",
    section: "hero",
    value: "Точность. Традиции. Триумф.",
    valueKk: "Дәлдік. Дәстүр. Жеңіс.",
    valueEn: "Precision. Tradition. Triumph.",
  },
  // About page - Mission
  {
    key: "about_hero_title_1",
    section: "about",
    value: "Национальная Федерация стрельбы из лука",
    valueKk: "Ұлттық Садақ Ату Федерациясы",
    valueEn: "National Archery Federation",
  },
  {
    key: "about_hero_title_2",
    section: "about",
    value: "Республики Казахстан",
    valueKk: "Қазақстан Республикасы",
    valueEn: "of the Republic of Kazakhstan",
  },
  {
    key: "mission_badge",
    section: "about",
    value: "Наша Миссия",
    valueKk: "Біздің Миссия",
    valueEn: "Our Mission",
  },
  {
    key: "mission_title",
    section: "about",
    value: "Формирование здоровой и сильной нации",
    valueKk: "Сау және күшті ұлтты қалыптастыру",
    valueEn: "Building a healthy and strong nation",
  },
  {
    key: "mission_desc",
    section: "about",
    value: "Наша миссия — формирование здоровой и сильной нации через развитие массового спорта и воспитание чемпионов мирового уровня. Мы стремимся сделать стрельбу из лука самым доступным и популярным видом спорта в Казахстане, создавая условия для раскрытия потенциала каждого атлета — от школьного стадиона до Олимпийского пьедестала.",
    valueKk: "Біздің миссиямыз — бұқаралық спортты дамыту және әлемдік деңгейдегі чемпиондарды дайындау арқылы сау және күшті ұлтты қалыптастыру. Біз садақ атуды Қазақстандағы ең қолжетімді және танымал спорт түріне айналдыруға ұмтыламыз.",
    valueEn: "Our mission is to build a healthy and strong nation through developing mass sports and nurturing world-class champions. We strive to make archery the most accessible and popular sport in Kazakhstan.",
  },
  {
    key: "recognition_title",
    section: "about",
    value: "Международное признание",
    valueKk: "Халықаралық тану",
    valueEn: "International Recognition",
  },
  {
    key: "recognition_desc",
    section: "about",
    value: "Федерация является полноправным членом World Archery и Asian Archery Federation. Мы соблюдаем высочайшие стандарты честной игры, антидопинговой политики и спортивной этики.",
    valueKk: "Федерация World Archery және Asian Archery Federation толыққанды мүшесі болып табылады. Біз әділ ойын, допингке қарсы саясат және спорттық этиканың ең жоғары стандарттарын сақтаймыз.",
    valueEn: "The Federation is a full member of World Archery and Asian Archery Federation. We uphold the highest standards of fair play, anti-doping policy, and sports ethics.",
  },
  // Footer
  {
    key: "footer_address",
    section: "footer",
    value: "г. Астана, Казахстан",
    valueKk: "Астана қ., Қазақстан",
    valueEn: "Astana, Kazakhstan",
  },
  {
    key: "footer_phone",
    section: "footer",
    value: "+7 (7172) 123-45-67",
    valueKk: "+7 (7172) 123-45-67",
    valueEn: "+7 (7172) 123-45-67",
  },
  {
    key: "footer_email",
    section: "footer",
    value: "info@archery.kz",
    valueKk: "info@archery.kz",
    valueEn: "info@archery.kz",
  },
];

// Site statistics data from about/page.tsx
const SITE_STATS_DATA = [
  {
    key: "regions",
    value: "20+",
    label: "Регионы и филиалы",
    labelKk: "Аймақтар мен филиалдар",
    labelEn: "Regions and branches",
    iconType: "mapPin",
    sortOrder: 1,
    isActive: true,
  },
  {
    key: "athletes",
    value: "15 000+",
    label: "Активные спортсмены",
    labelKk: "Белсенді спортшылар",
    labelEn: "Active athletes",
    iconType: "users",
    sortOrder: 2,
    isActive: true,
  },
  {
    key: "coaches",
    value: "350+",
    label: "Тренеры и судьи",
    labelKk: "Бапкерлер мен төрешілер",
    labelEn: "Coaches and referees",
    iconType: "badge",
    sortOrder: 3,
    isActive: true,
  },
  {
    key: "years",
    value: "50+",
    label: "Лет истории",
    labelKk: "Тарих жылы",
    labelEn: "Years of history",
    iconType: "trophy",
    sortOrder: 4,
    isActive: true,
  },
];

// Staff data from leadership/page.tsx
const STAFF_DATA = [
  {
    name: "Ахметов Нурлан Сапарович",
    nameKk: "Ахметов Нұрлан Сапарұлы",
    nameEn: "Nurlan Akhmetov",
    role: "president",
    roleTitle: "Президент Федерации",
    roleTitleKk: "Федерация Президенті",
    roleTitleEn: "Federation President",
    description: "Стрельба из лука – это древнее искусство, которое объединяет точность, концентрацию и дисциплину. Мы стремимся развивать этот вид спорта, сохраняя традиции наших предков и внедряя современные методики подготовки.",
    descriptionKk: "Садақ ату - дәлдік, шоғырлану және тәртіпті біріктіретін ежелгі өнер. Біз бабаларымыздың дәстүрлерін сақтай отырып және заманауи даярлау әдістемелерін енгізе отырып, бұл спорт түрін дамытуға тырысамыз.",
    descriptionEn: "Archery is an ancient art that combines precision, concentration and discipline. We strive to develop this sport while preserving the traditions of our ancestors and implementing modern training methods.",
    department: "leadership",
    image: null,
    sortOrder: 1,
    isActive: true,
  },
  {
    name: "Сериков Арман Болатович",
    nameKk: "Серіков Арман Болатұлы",
    nameEn: "Arman Serikov",
    role: "vice_president",
    roleTitle: "Вице-президент по спорту",
    roleTitleKk: "Спорт бойынша вице-президент",
    roleTitleEn: "Vice President for Sports",
    description: "Отвечает за спортивную подготовку и развитие",
    department: "leadership",
    image: null,
    sortOrder: 2,
    isActive: true,
  },
  {
    name: "Касымова Айгуль Маратовна",
    nameKk: "Қасымова Айгүл Маратқызы",
    nameEn: "Aigul Kasymova",
    role: "vice_president_regions",
    roleTitle: "Вице-президент по регионам",
    roleTitleKk: "Аймақтар бойынша вице-президент",
    roleTitleEn: "Vice President for Regions",
    description: "Координация работы региональных филиалов",
    department: "leadership",
    image: null,
    sortOrder: 3,
    isActive: true,
  },
  {
    name: "Жумабеков Ерлан Кайратович",
    nameKk: "Жұмабеков Ерлан Қайратұлы",
    nameEn: "Yerlan Zhumabekov",
    role: "secretary_general",
    roleTitle: "Генеральный секретарь",
    roleTitleKk: "Бас хатшы",
    roleTitleEn: "Secretary General",
    description: "Организация работы федерации",
    department: "committee",
    image: null,
    sortOrder: 4,
    isActive: true,
  },
  {
    name: "Омарова Динара Сериковна",
    nameKk: "Омарова Динара Серікқызы",
    nameEn: "Dinara Omarova",
    role: "cfo",
    roleTitle: "Финансовый директор",
    roleTitleKk: "Қаржы директоры",
    roleTitleEn: "Chief Financial Officer",
    description: "Финансовое управление",
    department: "committee",
    image: null,
    sortOrder: 5,
    isActive: true,
  },
  {
    name: "Ким Константин Владимирович",
    nameKk: "Ким Константин Владимирович",
    nameEn: "Konstantin Kim",
    role: "head_coach",
    roleTitle: "Главный тренер сборной",
    roleTitleKk: "Құраманың бас бапкері",
    roleTitleEn: "Head Coach of National Team",
    description: "Подготовка сборной команды",
    department: "coaching",
    image: null,
    sortOrder: 6,
    isActive: true,
  },
  {
    name: "Байжанов Марат Серикович",
    nameKk: "Байжанов Марат Серікұлы",
    nameEn: "Marat Baizhanov",
    role: "senior_coach_recurve",
    roleTitle: "Тренер по классическому луку",
    roleTitleKk: "Классикалық садақ бойынша бапкер",
    roleTitleEn: "Recurve Coach",
    description: "Recurve тренер",
    department: "coaching",
    image: null,
    sortOrder: 7,
    isActive: true,
  },
  {
    name: "Тасболатов Нуржан Кайратович",
    nameKk: "Тасболатов Нұржан Қайратұлы",
    nameEn: "Nurzhan Tasbolatov",
    role: "senior_coach_compound",
    roleTitle: "Тренер по блочному луку",
    roleTitleKk: "Блок садақ бойынша бапкер",
    roleTitleEn: "Compound Coach",
    description: "Compound тренер",
    department: "coaching",
    image: null,
    sortOrder: 8,
    isActive: true,
  },
];

async function main() {
  console.log('Starting database seed...');

  // 1. Create Admin and Editor users
  const adminPasswordHash = await bcrypt.hash('admin123', 10);
  const editorPasswordHash = await bcrypt.hash('editor123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPasswordHash,
      role: 'Admin',
    },
  });
  console.log('Created admin user (password: admin123)');

  await prisma.user.upsert({
    where: { username: 'editor' },
    update: {},
    create: {
      username: 'editor',
      password: editorPasswordHash,
      role: 'Editor',
    },
  });
  console.log('Created editor user (password: editor123)');

  // 2. Regional users will be created after regions (step 9b)

  // 3. Create Tournament
  await prisma.tournament.upsert({
    where: { id: 1 },
    update: {
      description: "Главное событие года в мире стрельбы из лука. Лучшие спортсмены страны соберутся в Алматы.",
      descriptionKk: "Садақ атудан жылдың ең маңызды оқиғасы. Елдің үздік спортшылары Алматыда жиналады.",
      descriptionEn: "The main event of the year in archery. The best athletes of the country will gather in Almaty.",
      location: "Алматы, Трамплины",
      locationKk: "Алматы, Трамплиндер",
      locationEn: "Almaty, Ski Jumps",
      isFeatured: true,
    },
    create: {
      title: "Чемпионат Республики Казахстан 2025",
      titleKk: "Қазақстан Республикасының Чемпионаты 2025",
      titleEn: "Championship of the Republic of Kazakhstan 2025",
      description: "Главное событие года в мире стрельбы из лука. Лучшие спортсмены страны соберутся в Алматы.",
      descriptionKk: "Садақ атудан жылдың ең маңызды оқиғасы. Елдің үздік спортшылары Алматыда жиналады.",
      descriptionEn: "The main event of the year in archery. The best athletes of the country will gather in Almaty.",
      startDate: new Date('2025-02-15'),
      endDate: new Date('2025-02-20'),
      location: "Алматы, Трамплины",
      locationKk: "Алматы, Трамплиндер",
      locationEn: "Almaty, Ski Jumps",
      isRegistrationOpen: true,
      isFeatured: true,
    },
  });
  console.log('Created tournament');

  // 4. Seed News
  for (const newsItem of NEWS_DATA) {
    await prisma.news.upsert({
      where: { slug: newsItem.slug },
      update: newsItem,
      create: newsItem,
    });
  }
  console.log(`Created ${NEWS_DATA.length} news items`);

  // 5. Seed Athletes (547 real athletes from 2026 rating)
  console.log('Seeding athletes...');

  // Track count per category to limit national team to top 20
  const categoryCount: Record<string, number> = {};
  const TOP_N = 20; // Top 20 athletes per category go to national team

  for (const member of TEAM_MEMBERS_DATA_2026) {
    const athlete = await prisma.athlete.upsert({
      where: { slug: member.slug },
      update: {
        name: member.name,
        gender: member.gender,
        region: member.region,
        sortOrder: member.sortOrder,
        isActive: member.isActive,
      },
      create: {
        slug: member.slug,
        name: member.name,
        gender: member.gender,
        region: member.region,
        sortOrder: member.sortOrder,
        isActive: member.isActive,
      },
    });

    // Only add top 20 per category to national team
    const categoryKey = `${member.category}-${member.gender}-${member.type}`;
    categoryCount[categoryKey] = (categoryCount[categoryKey] || 0) + 1;

    if (categoryCount[categoryKey] <= TOP_N) {
      await prisma.nationalTeamMembership.upsert({
        where: {
          athleteId_category_gender_type: {
            athleteId: athlete.id,
            category: member.category,
            gender: member.gender,
            type: member.type,
          },
        },
        update: {},
        create: {
          athleteId: athlete.id,
          category: member.category,
          gender: member.gender,
          type: member.type,
          isActive: true,
        },
      });
    }
  }

  const totalTeamMembers = Object.values(categoryCount).reduce((sum, count) => sum + Math.min(count, TOP_N), 0);
  console.log(`Created ${TEAM_MEMBERS_DATA_2026.length} athletes, ${totalTeamMembers} in national team (top ${TOP_N} per category)`);

  // 7. Seed Rankings (by category/gender/type)
  console.log('Seeding rankings...');
  for (const ranking of RANKINGS_DATA_2026) {
    // Find the member data to get type/gender/category
    const memberData = TEAM_MEMBERS_DATA_2026.find(m => m.slug === ranking.slug);
    if (!memberData) {
      console.log(`Warning: No member data found for ranking slug: ${ranking.slug}`);
      continue;
    }

    const athlete = await prisma.athlete.findUnique({
      where: { slug: ranking.slug },
    });
    if (athlete) {
      await prisma.rankingEntry.upsert({
        where: {
          athleteId_category_gender_type: {
            athleteId: athlete.id,
            category: memberData.category,
            gender: memberData.gender,
            type: memberData.type,
          },
        },
        update: {
          points: ranking.points,
          rank: ranking.rank,
        },
        create: {
          athleteId: athlete.id,
          category: memberData.category,
          gender: memberData.gender,
          type: memberData.type,
          points: ranking.points,
          rank: ranking.rank,
        },
      });
    }
  }
  console.log(`Created ${RANKINGS_DATA_2026.length} ranking entries`);

  // 8. Seed Partners
  for (let i = 0; i < PARTNERS_DATA.length; i++) {
    await prisma.partner.upsert({
      where: { id: i + 1 },
      update: PARTNERS_DATA[i],
      create: { ...PARTNERS_DATA[i], updatedAt: new Date() },
    });
  }
  console.log(`Created ${PARTNERS_DATA.length} partners`);

  // 9. Seed Regional Branches
  for (let i = 0; i < REGIONAL_BRANCHES_DATA.length; i++) {
    await prisma.region.upsert({
      where: { id: i + 1 },
      update: REGIONAL_BRANCHES_DATA[i],
      create: { ...REGIONAL_BRANCHES_DATA[i], updatedAt: new Date() },
    });
  }
  console.log(`Created ${REGIONAL_BRANCHES_DATA.length} regional branches`);

  // 9b. Create Regional Users with region links
  const regionalPasswordHash = await bcrypt.hash('123456', 10);
  const allRegions = await prisma.region.findMany();
  for (const region of allRegions) {
    // Extract city name from region name: "Филиал г. Астана" -> "Астана"
    const username = region.nameEn?.replace(' Branch', '').trim() ||
      region.name.replace('Филиал ', '').replace('г. ', '').trim();

    await prisma.user.upsert({
      where: { username },
      update: { regionId: region.id, region: region.name },
      create: {
        username,
        password: regionalPasswordHash,
        role: 'RegionalRepresentative',
        regionId: region.id,
        region: region.name,
      },
    });
  }
  console.log(`Created ${allRegions.length} regional users with region links`);

  // 10. Seed History Events
  for (let i = 0; i < HISTORY_EVENTS_DATA.length; i++) {
    await prisma.historyEvent.upsert({
      where: { id: i + 1 },
      update: HISTORY_EVENTS_DATA[i],
      create: { ...HISTORY_EVENTS_DATA[i], updatedAt: new Date() },
    });
  }
  console.log(`Created ${HISTORY_EVENTS_DATA.length} history events`);

  // 11. Seed Protocols
  for (let i = 0; i < PROTOCOLS_DATA.length; i++) {
    await prisma.protocol.upsert({
      where: { id: i + 1 },
      update: PROTOCOLS_DATA[i],
      create: { ...PROTOCOLS_DATA[i], updatedAt: new Date() },
    });
  }
  console.log(`Created ${PROTOCOLS_DATA.length} protocols`);

  // 12. Seed Gallery
  for (let i = 0; i < GALLERY_DATA.length; i++) {
    await prisma.galleryItem.upsert({
      where: { id: i + 1 },
      update: GALLERY_DATA[i],
      create: { ...GALLERY_DATA[i], updatedAt: new Date() },
    });
  }
  console.log(`Created ${GALLERY_DATA.length} gallery items`);

  // 13. Seed Staff
  for (let i = 0; i < STAFF_DATA.length; i++) {
    await prisma.staff.upsert({
      where: { id: i + 1 },
      update: STAFF_DATA[i],
      create: { ...STAFF_DATA[i], updatedAt: new Date() },
    });
  }
  console.log(`Created ${STAFF_DATA.length} staff members`);

  // 14. Seed Documents
  for (let i = 0; i < DOCUMENTS_DATA.length; i++) {
    await prisma.document.upsert({
      where: { id: i + 1 },
      update: DOCUMENTS_DATA[i],
      create: { ...DOCUMENTS_DATA[i], updatedAt: new Date() },
    });
  }
  console.log(`Created ${DOCUMENTS_DATA.length} documents`);

  // 15. Seed Site Stats
  for (const stat of SITE_STATS_DATA) {
    await prisma.siteStat.upsert({
      where: { key: stat.key },
      update: stat,
      create: { ...stat, updatedAt: new Date() },
    });
  }
  console.log(`Created ${SITE_STATS_DATA.length} site statistics`);

  // 16. Seed Site Content
  for (const content of SITE_CONTENT_DATA) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: content,
      create: { ...content, updatedAt: new Date() },
    });
  }
  console.log(`Created ${SITE_CONTENT_DATA.length} site content items`);

  console.log('\nSeed completed successfully!');
  console.log('\nDefault credentials:');
  console.log('  Admin: admin / admin123');
  console.log('  Editor: editor / editor123');
  console.log('  Regional: [RegionName] / 123456');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
