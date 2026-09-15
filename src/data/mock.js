// Mock data — replace with real API data later.

export const projectStats = [
  { value: "6", label: "bina" },
  { value: "1.5 ha", label: "qapalı həyət" },
  { value: "420", label: "mənzil" },
  { value: "2 mərtəbə", label: "yeraltı parkinq" },
];

export const projectFeatures = [
  {
    title: "Mənzil seçimi",
    description: "Otaq sayı, sahə, mərtəbə və status üzrə real vaxt filtrləmə.",
  },
  {
    title: "Yaşıl həyat",
    description: "Avtomobilsiz həyət, ailə zonaları və gündəlik rahatlıq.",
  },
  {
    title: "Sürətli əlaqə",
    description: "1 kliklə WhatsApp, zəng, sorğu və satış meneceri ilə əlaqə.",
  },
];

export const apartmentPage = {
  title: "Mənzilini seç",
  subtitle: "Mövcud mənzilləri rahat şəkildə filtrlə və müqayisə et.",
  floorLabel: "Bina {building} · {floorOrdinal} mərtəbə",
};

export const apartmentStatuses = {
  available: "Mövcud",
  reserved: "Rezerv",
  sold: "Satılıb",
};

// type "match": option value must equal the apartment field.
// type "range": numeric field must fall within the option's min/max (either may be omitted).
// Options follow the real apartments below, so every choice returns at least one flat.
export const apartmentFilters = [
  {
    field: "building",
    label: "Bina",
    type: "match",
    defaultValue: "all",
    options: [
      { value: "all", label: "Hamısı" },
      { value: "A", label: "Bina A" },
      { value: "B", label: "Bina B" },
    ],
  },
  {
    field: "rooms",
    label: "Otaq",
    type: "range",
    defaultValue: "all",
    options: [
      { value: "all", label: "Hamısı" },
      { value: "2", label: "2", min: 2, max: 2 },
      { value: "3", label: "3", min: 3, max: 3 },
    ],
  },
  {
    field: "area",
    label: "Sahə",
    type: "range",
    defaultValue: "all",
    options: [
      { value: "all", label: "Hamısı" },
      { value: "0-90", label: "90 m²-dək", max: 90 },
      { value: "90-115", label: "90–115 m²", min: 90, max: 115 },
      { value: "115+", label: "115 m²-dən çox", min: 115 },
    ],
  },
  {
    field: "floor",
    label: "Mərtəbə",
    type: "range",
    defaultValue: "all",
    options: [
      { value: "all", label: "Hamısı" },
      { value: "1-5", label: "1–5", min: 1, max: 5 },
      { value: "6-10", label: "6–10", min: 6, max: 10 },
      { value: "11+", label: "11+", min: 11 },
    ],
  },
  {
    field: "status",
    label: "Status",
    type: "match",
    defaultValue: "all",
    options: [
      { value: "all", label: "Hamısı" },
      ...Object.entries(apartmentStatuses).map(([value, label]) => ({
        value,
        label,
      })),
    ],
  },
];

// Plans and room areas are from Çınarlı MTK's Instagram posts.
// Building, floor, unit number, status and renovation are placeholders until the real data arrives.
// `plan` is a key of planImages in src/components/PlanCard.jsx.
export const apartments = [
  {
    id: "A-04-12",
    unit: "12",
    highlights: ["1 balkon", "Geniş zal", "Ailə planlaması"],
    rooms: 2,
    area: "82.10",
    building: "A",
    floor: 4,
    balconies: 1,
    renovation: "Seçimə görə",
    status: "available",
    plan: "2-otaq-82-10",
    layout: [
      { name: "Zal + mətbəx", area: "23.90" },
      { name: "Yataq otağı", area: "21.74" },
      { name: "Zal", area: "15.84" },
      { name: "Holl", area: "10.40" },
      { name: "Sanitar qovşağı", area: "5.03" },
      { name: "Balkon", area: "5.19" },
    ],
  },
  {
    id: "A-09-27",
    unit: "27",
    highlights: ["1 balkon", "2 sanitar qovşağı", "Geniş holl"],
    rooms: 3,
    area: "96.66",
    building: "A",
    floor: 9,
    balconies: 1,
    renovation: "Ağ karkas",
    status: "available",
    plan: "3-otaq-96-66",
    layout: [
      { name: "Zal", area: "21.00" },
      { name: "Holl", area: "17.59" },
      { name: "Yataq otağı", area: "15.68" },
      { name: "Yataq otağı", area: "15.46" },
      { name: "Mətbəx", area: "8.72" },
      { name: "Sanitar qovşağı 1", area: "6.13" },
      { name: "Sanitar qovşağı 2", area: "5.48" },
      { name: "Balkon", area: "6.60" },
    ],
  },
  {
    id: "B-12-45",
    unit: "45",
    highlights: ["1 balkon", "2 sanitar qovşağı", "Geniş zal"],
    rooms: 3,
    area: "114.95",
    building: "B",
    floor: 12,
    balconies: 1,
    renovation: "Seçimə görə",
    status: "reserved",
    plan: "3-otaq-114-95",
    layout: [
      { name: "Zal", area: "29.20" },
      { name: "Yataq otağı", area: "21.54" },
      { name: "Yataq otağı", area: "18.88" },
      { name: "Mətbəx", area: "16.29" },
      { name: "Holl", area: "13.14" },
      { name: "Sanitar qovşağı 1", area: "5.82" },
      { name: "Sanitar qovşağı 2", area: "4.00" },
      { name: "Balkon", area: "6.08" },
    ],
  },
  {
    id: "B-16-61",
    unit: "61",
    highlights: ["1 balkon", "2 sanitar qovşağı", "Geniş qonaq otağı"],
    rooms: 3,
    area: "116.35",
    building: "B",
    floor: 16,
    balconies: 1,
    renovation: "Təmirli",
    status: "sold",
    plan: "3-otaq-116-35",
    layout: [
      { name: "Qonaq otağı", area: "28.62" },
      { name: "Yataq otağı", area: "22.23" },
      { name: "Yataq otağı", area: "18.62" },
      { name: "Mətbəx", area: "16.28" },
      { name: "Holl", area: "15.56" },
      { name: "Sanitar qovşağı 1", area: "4.08" },
      { name: "Sanitar qovşağı 2", area: "4.29" },
      { name: "Balkon", area: "6.67" },
    ],
  },
];

export const advantages = {
  titleLines: ["Gündəlik rahatlıq üçün", "düşünülmüş üstünlüklər."],
  description: "Sadəcə bina deyil - ailə həyatı üçün planlanmış mühit.",
  highlight: {
    title: "Avtomobilsiz yaşıl həyət",
    descriptionLines: [
      "Uşaqlar üçün daha təhlükəsiz,",
      "ailə üçün daha sakit gündəlik həyat.",
    ],
  },
  items: [
    {
      value: "2 mərtəbə",
      label: "Yeraltı parking",
      description: "Daha rahat yaşayış üçün praktik həll.",
    },
    {
      value: "24/7",
      label: "Təhlükəsizlik",
      description: "Daha rahat yaşayış üçün praktik həll.",
    },
    {
      value: "Ailə zonaları",
      label: "Uşaq və istirahət məkanları",
      description: "Daha rahat yaşayış üçün praktik həll.",
    },
    {
      value: "Yaşıl sahələr",
      label: "Həyətin əsas elementi",
      description: "Daha rahat yaşayış üçün praktik həll.",
    },
  ],
};

export const gallery = {
  title: "Layihəni yaxından görün.",
  subtitle: "Eksteryer, həyət, mənzil planları və layihə atmosferi.",
  photoCount: 42,
  videoCount: 6,
  // First image is the large one; `key` maps to a file in src/assets/gallery.
  // `position` is an optional CSS object-position for the crop (default: center).
  images: [
    { key: "tower", alt: "Yaşıllıq fonunda yaşayış binası" },
    { key: "balconies", alt: "Balkonlu yaşayış binasının fasadı" },
    { key: "interior", alt: "İşıqlı qonaq otağının interyeri" },
    { key: "plan", alt: "Mənzilin 3D planı", position: "50% 12%" },
    { key: "greenery", alt: "Yaşıl balkonlu müasir yaşayış binası" },
  ],
  // /qalereya page: every photo in a masonry grid, filterable by category.
  // `key` maps to a file in src/lib/galleryPhotos.js; ru/en override `alt` and labels by position.
  pageTitle: "Qalereya",
  pageSubtitle:
    "Eksteryer, interyer, balkonlar və planlar — layihənin bütün fotoları bir yerdə.",
  categories: [
    { id: "exterior", label: "Eksteryer" },
    { id: "interior", label: "İnteryer" },
    { id: "outdoor", label: "Balkon və həyət" },
    { id: "plans", label: "Planlar" },
  ],
  photos: [
    { key: "tower", category: "exterior", alt: "Yaşıllıq fonunda yaşayış binası" },
    { key: "livingBeige", category: "interior", alt: "Açıq tonlarda geniş qonaq otağı" },
    { key: "exteriorTerraces", category: "exterior", alt: "Yaşıl terraslı ağ yaşayış binası" },
    { key: "kitchenMarble", category: "interior", alt: "Mərmər səthli müasir mətbəx" },
    { key: "balconyGlass", category: "outdoor", alt: "Şüşə məhəccərli yaşıl balkon" },
    { key: "hero", category: "exterior", alt: "Çınarlı Park yaşayış kompleksi" },
    { key: "livingRoom", category: "interior", alt: "Minimalist qonaq otağı" },
    { key: "greenery", category: "exterior", alt: "Yaşıl balkonlu müasir yaşayış binası" },
    { key: "bedroom", category: "interior", alt: "Bitkilərlə bəzədilmiş yataq otağı" },
    { key: "exteriorGlass", category: "exterior", alt: "Şüşə eyvanlı fasad" },
    { key: "balconyCafe", category: "outdoor", alt: "Stol və stullarla balkon guşəsi" },
    { key: "interior", category: "interior", alt: "İşıqlı qonaq otağının interyeri" },
    { key: "villa", category: "outdoor", alt: "Ağaclar arasında müasir yaşayış binası" },
    { key: "kitchenGalley", category: "interior", alt: "Bağçaya açılan uzun mətbəx" },
    { key: "exteriorSunset", category: "exterior", alt: "Gün batımında balkonlu yaşayış binası" },
    { key: "livingGreenSofa", category: "interior", alt: "Yaşıl divanlı qonaq otağı" },
    { key: "balconies", category: "exterior", alt: "Balkonlu yaşayış binasının fasadı" },
    { key: "balconyGarden", category: "outdoor", alt: "Bitkilərlə dolu balkon" },
    { key: "dining", category: "interior", alt: "Mətbəxə bitişik yemək zonası" },
    { key: "exteriorBeige", category: "exterior", alt: "Bej tonlu müasir fasad" },
    { key: "livingKitchen", category: "interior", alt: "Mətbəxlə birləşən qonaq otağı" },
    { key: "exteriorWhite", category: "exterior", alt: "Ağ rəngli çoxmərtəbəli bina" },
    { key: "plan", category: "plans", alt: "Mənzilin 3D planı" },
  ],
};

export const locationInfo = {
  title: "Hər şeyə yaxın.",
  description: "Gündəlik marşrutlarınızı qısaldan şəhər içi yerləşmə.",
  address: "3121 Abay Kunanbayev St, Baku",
  // Abay Kunanbayev küçəsi, Dərnəgül (OpenStreetMap geocode).
  origin: { lat: 40.4294708, lng: 49.849738 },
  nearbyTitle: "Yaxınlıqda",
  // Nearest place per category from OpenStreetMap, at least ~400 m on foot so Google's
  // walking embed can draw a route (closer points snap to the same road). `time` is walking time from `origin`.
  // `types` are Google Places (New) types, used instead when GOOGLE_MAPS_API_KEY is set.
  nearby: [
    {
      key: "transit",
      label: "Metro / nəqliyyat",
      name: "Azadlıq prospekti metro stansiyası",
      location: { lat: 40.425962, lng: 49.842926 },
      time: "12 dəq",
      types: ["subway_station", "transit_station"],
    },
    {
      key: "school",
      label: "Məktəb",
      name: "244 saylı məktəb",
      location: { lat: 40.429518, lng: 49.853152 },
      time: "5 dəq",
      types: ["school", "primary_school", "secondary_school"],
    },
    {
      key: "supermarket",
      label: "Supermarket",
      name: "Araz Supermarket",
      location: { lat: 40.4269246, lng: 49.8495032 },
      time: "6 dəq",
      types: ["supermarket", "grocery_store"],
    },
    {
      key: "park",
      label: "Park",
      name: "Azadlıq prospekti parkı",
      location: { lat: 40.435333, lng: 49.843626 },
      time: "17 dəq",
      types: ["park"],
    },
    {
      key: "clinic",
      label: "Klinika",
      name: "Laçın Tibb Mərkəzi",
      location: { lat: 40.4264963, lng: 49.8501233 },
      time: "7 dəq",
      types: ["medical_clinic", "hospital", "doctor"],
    },
  ],
  routeLabel: "Satış ofisinə marşrut",
};

export const contactPage = {
  titleLines: ["Sualınız var?", "Komandamızla danışın."],
  office: {
    label: "Satış ofisi",
    name: "Çınarlı Park",
    details: [
      { label: "Telefon", value: "+994 50 000 00 00" },
      { label: "WhatsApp", value: "1 kliklə yazın" },
      { label: "İş saatları", value: "10:00 - 19:00" },
      { label: "Ünvan", value: locationInfo.address },
    ],
    phoneHref: "tel:+994500000000",
    whatsappHref: "https://wa.me/994500000000",
  },
  faqTitle: "Tez-tez verilən suallar",
  faqs: [
    {
      question: "Mənzillərin qiyməti necə hesablanır?",
      answer:
        "Qiymət mənzilin sahəsi, mərtəbəsi, baxış istiqaməti və təmir seçimi əsasında hesablanır. Seçdiyiniz mənzilin dəqiq qiymətini satış menecerimiz təqdim edəcək.",
    },
    {
      question: "İlkin ödəniş neçə faizdir?",
      answer:
        "İlkin ödəniş mənzil dəyərinin 20%-dən başlayır. Qalan məbləği 36 ayadək faizsiz daxili hissəli ödənişlə ödəmək mümkündür.",
    },
    {
      question: "Mənzili onlayn rezerv etmək olar?",
      answer:
        "Bəli. Bəyəndiyiniz mənzili seçib müraciət göndərin — menecerimiz sizinlə əlaqə saxlayacaq və mənzil 3 iş günü müddətinə sizin adınıza rezerv ediləcək.",
    },
    {
      question: "Təmirli mənzil seçimi varmı?",
      answer:
        "Bəli. Mənzilləri qara karkas, ağ karkas və ya tam təmirli variantda almaq olar. Təmir paketləri barədə ətraflı məlumatı satış ofisində təqdim edirik.",
    },
    {
      question: "Tikintinin təhvil tarixi nə vaxtdır?",
      answer:
        "Birinci mərhələnin təhvili 2027-ci ilin IV rübünə, ikinci mərhələnin təhvili isə 2028-ci ilin sonuna planlaşdırılır.",
    },
  ],
  meetingLabel: "Görüş təyin et",
};

// Displayed values only; the calculator is not functional yet.
export const paymentCalculator = {
  title: "Ödənişinizi hesablayın.",
  subtitle:
    "Mənzil seçiminizə uyğun nümunə ödəniş planını saniyələr içində görün.",
  formTitle: "Ödəniş kalkulyatoru",
  planTitle: "Nümunə plan",
  currency: "AZN",
  price: 185000,
  downPayment: 37000,
  months: 36,
};

export const constructionProgress = {
  title: "Tikintinin gedişi.",
  subtitle: "İrəliləyişi tarix üzrə şəffaf şəkildə izləyin.",
  // Latest update, shown large with a photo; `progress` is a percentage.
  featured: {
    date: "Sentyabr 2026",
    title: "Korpus B - fasad və daxili işlər",
    progressLabel: "Ümumi irəliləyiş",
    progress: 83,
  },
  updates: [
    { date: "Avqust 2026", title: "Korpus A", progress: 76 },
    { date: "İyul 2026", title: "Yeraltı parking", progress: 92 },
    { date: "İyun 2026", title: "Həyət infrastrukturu", progress: 61 },
    { date: "May 2026", title: "Korpus C", progress: 54 },
  ],
  allUpdatesLabel: "Bütün yeniliklər",
};

// Mobile home: card under the hero; its rows come from apartmentFilters' defaults.
export const quickSearch = {
  title: "Sürətli mənzil axtarışı",
  buttonLabel: "Mövcud mənzilləri göstər",
};

export const footer = {
  title: "Şəhərin içində. Təbiətə daha yaxın.",
  subtitle: "Mənzil seçimi və satış yönümlü rəqəmsal təcrübə.",
  description:
    "Nömrənizi qoyun — satış komandamız iş saatlarında sizinlə əlaqə saxlayacaq.",
  // `style`: "dark", "light" or "outline".
  actions: [
    { label: "Mənzil seç", href: "/menziller", style: "dark" },
    { label: "Məsləhət al", href: "/elaqe", style: "light" },
    { label: "Yerləşmə", href: "/#yerlesme", style: "outline" },
  ],
  form: {
    title: "Sizə zəng edək",
    phoneLabel: "Telefon nömrəsi",
    submitLabel: "Göndər",
    successMessage:
      "Təşəkkürlər! Satış komandamız tezliklə sizinlə əlaqə saxlayacaq.",
  },
  copyright: "Çınarlı Park. Bütün hüquqlar qorunur.",
  links: [
    { label: "Layihə", href: "/#layihe" },
    { label: "Mənzillər", href: "/menziller" },
    { label: "Qalereya", href: "/#qalereya" },
    { label: "Əlaqə", href: "/elaqe" },
    { label: contactPage.office.details[0].value, href: contactPage.office.phoneHref },
    { label: "WhatsApp", href: contactPage.office.whatsappHref },
  ],
};

// Search results and link previews. Page titles get " | Çınarlı Park" appended (home uses its title as is).
export const seo = {
  siteName: "Çınarlı Park",
  tagline: "Şəhərin içində. Təbiətə daha yaxın.",
  locationLabel: "Bakı, Binəqədi rayonu",
  home: {
    title: "Çınarlı Park — Bakıda yeni tikili mənzillər",
    description:
      "Çınarlı Park — Bakının Binəqədi rayonunda yaşıl, avtomobilsiz həyətli yeni yaşayış kompleksi. 2 və 3 otaqlı mənzillər, yeraltı parkinq, metroya yaxın.",
  },
  apartments: {
    title: "Mənzillər — 2 və 3 otaqlı yeni tikili mənzillər",
    description:
      "Çınarlı Park-da mənzilləri otaq sayı, sahə, mərtəbə və statusa görə seçin: planlar, otaqların sahələri və mövcudluq.",
  },
  contact: {
    title: "Əlaqə — satış ofisi",
    description:
      "Çınarlı Park satış ofisi: telefon, WhatsApp, iş saatları və ünvan. Qiymət, ilkin ödəniş və rezerv barədə tez-tez verilən suallar.",
  },
  gallery: {
    title: "Qalereya — layihənin fotoları",
    description:
      "Çınarlı Park fotoqalereyası: yaşayış binalarının eksteryeri, mənzil interyerləri, balkonlar, həyət və mənzil planları.",
  },
};

export const projectOverview = {
  titleLines: ["Şəhərin içində.", "Təbiətə daha yaxın."],
  description:
    "Çınarlı Park gündəlik şəhər rahatlığını, ailə həyatı və yaşıllıqla birləşdirən müasir yaşayış kompleksidir.",
  stats: [
    { value: "6", label: "bina" },
    { value: "420", label: "mənzil" },
    { value: "1.5 ha", label: "qapalı həyət" },
    { value: "2 mərtəbə", label: "yeraltı parkinq" },
  ],
  features: [
    {
      title: "Ailə üçün planlanıb",
      description: "Geniş həyət, uşaq zonaları və sakit daxili məkan.",
    },
    {
      title: "Yaşıl həyat",
      description: "Avtomobilsiz həyət və gündəlik yaşıl mühit.",
    },
    {
      title: "Şəhərə yaxın",
      description: "İş, məktəb və xidmətlərə rahat bağlantı.",
    },
  ],
};
