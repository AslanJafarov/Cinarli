// `preview`: the page the section is on; SitePreview.jsx shows that page cropped to the
// element marked data-admin-preview="<key>". `viewport` is the page width (default 1440). `href`: where "Saytda bax" opens it.

// Edited most often: listed first in the sidebar.
export const MAIN_SECTIONS = [
  {
    key: "leads",
    special: true,
    title: "Müraciətlər",
    icon: "inbox",
    summary: "Saytdan gələn zəng sorğuları",
    description:
      "Saytdakı formalardan göndərilən telefon nömrələri. Zəng etdikdən sonra “Baxıldı” kimi işarələyin. Buradakı dəyişikliklər dərhal yadda qalır.",
    where: "Footer-dəki “Sizə zəng edək” forması və mənzil səhifəsindəki forma",
    href: null,
  },
  {
    key: "apartments",
    title: "Mənzillər",
    icon: "building",
    summary: "Planlar, sahələr, statuslar",
    description:
      "Hər mənzilin plan şəkli, fotoları və mənzil səhifəsində göstərilən bütün məlumatları.",
    where: "Mənzillər səhifəsi və hər mənzilin öz səhifəsi",
    href: "/menziller",
    preview: { path: "/menziller" },
  },
  {
    key: "gallery",
    title: "Qalereya",
    icon: "photo",
    summary: "Layihənin fotoları",
    description:
      "Yeni foto yükləyin, lazımsızları silin və ardıcıllığı dəyişin. İlk beş foto ana səhifədə də görünür.",
    where: "Ana səhifədəki qalereya bölməsi və Qalereya səhifəsi",
    href: "/qalereya",
    preview: { path: "/" },
  },
  {
    key: "news",
    title: "Xəbərlər",
    icon: "news",
    summary: "Yeniliklər və elanlar",
    description:
      "Xəbər əlavə edin, şəkil yükləyin və mətni yazın. Xəbərlər saytda tarixə görə, ən yenisi birinci göstərilir.",
    where: "Xəbərlər səhifəsi və hər xəbərin öz səhifəsi",
    href: "/xeberler",
    preview: { path: "/xeberler" },
  },
  {
    key: "constructionProgress",
    title: "Tikintinin gedişi",
    icon: "progress",
    summary: "Son yenilik və faizlər",
    description: "Son yenilik və tarix üzrə irəliləyiş faizləri.",
    where: "Ana səhifə, “Tikinti” bölməsi",
    href: "/#tikinti",
    preview: { path: "/" },
  },
  {
    key: "siteImages",
    title: "Sayt şəkilləri",
    icon: "photo",
    summary: "Giriş, layihə, üstünlüklər, tikinti",
    description:
      "Ana səhifə bölmələrinin böyük şəkilləri. Şəkil yüklənməyibsə, həmin yerdə brend yaşıl fonu görünür.",
    where: "Ana səhifə: giriş, “Layihə”, “Üstünlüklər” və “Tikinti” bölmələri",
    href: "/",
    preview: { path: "/" },
  },
  {
    key: "contactPage",
    title: "Əlaqə və suallar",
    icon: "chat",
    summary: "Telefon, ünvan, FAQ",
    description: "Satış ofisinin məlumatları və tez-tez verilən suallar.",
    where: "Əlaqə səhifəsi",
    href: "/elaqe",
    preview: { path: "/elaqe" },
  },
];

// Texts and settings that rarely change: a separate menu.
// `special` sections aren't a key of the site data and have their own editor.
export const TEXT_GROUPS = [
  {
    group: "Dillər",
    items: [
      {
        key: "translations",
        special: true,
        title: "Tərcümələr (RU / EN)",
        description:
          "Saytdakı hər azərbaycanca mətnin rusca və ingiliscə variantı. Tərcümə mətnə bağlıdır: elementlərin yerini dəyişəndə itmir. Mətni azərbaycanca dəyişsəniz, yenisini burada tərcümə edin; tərcümə olunmayan mətn RU/EN səhifələrində azərbaycanca görünür.",
        where: "Rus və ingilis dilli səhifələr",
        href: "/ru",
      },
    ],
  },
  {
    group: "Ana səhifə",
    items: [
      {
        key: "projectStats",
        title: "Əsas göstəricilər",
        description: "Hero bölməsinin altındakı dörd rəqəm.",
        where: "Ana səhifə, girişin altındakı rəqəmlər",
        href: "/",
        preview: { path: "/" },
      },
      {
        key: "projectFeatures",
        title: "Xüsusiyyət kartları",
        description: "Göstəricilərin altındakı üç kart.",
        where: "Ana səhifə, rəqəmlərin altındakı kartlar",
        href: "/",
        preview: { path: "/" },
      },
      {
        key: "projectOverview",
        title: "Layihə haqqında",
        description: "“Layihə” bölməsinin başlığı, göstəriciləri və kartları.",
        where: "Ana səhifə, “Layihə” bölməsi",
        href: "/#layihe",
        preview: { path: "/" },
      },
      {
        key: "advantages",
        title: "Üstünlüklər",
        description: "Üstünlüklər bölməsinin başlığı və elementləri.",
        where: "Ana səhifə, “Üstünlüklər” bölməsi",
        href: "/#ustunlukler",
        preview: { path: "/" },
      },
      {
        key: "locationInfo",
        title: "Yerləşmə",
        description: "Ünvan, xəritə koordinatları və yaxınlıqdakı məkanlar.",
        where: "Ana səhifə, xəritə bölməsi",
        href: "/#yerlesme",
        preview: { path: "/" },
      },
      {
        key: "paymentCalculator",
        title: "Ödəniş kalkulyatoru",
        description: "Nümunə ödəniş planı üçün mətnlər və dəyərlər.",
        where: "Ana səhifə, ödəniş bölməsi",
        href: "/#odenis",
        preview: { path: "/" },
      },
      {
        key: "quickSearch",
        title: "Sürətli axtarış",
        description: "Girişin altındakı “mənzil axtar” kartı: otaq, sahə və mərtəbə seçib mənzillərə keçid.",
        where: "Ana səhifə",
        href: "/",
        preview: { path: "/" },
      },
    ],
  },
  {
    group: "Mənzillər səhifəsi",
    items: [
      {
        key: "apartmentPage",
        title: "Başlıq",
        description: "Səhifə başlığı, alt başlıq və mərtəbə etiketi.",
        where: "Mənzillər səhifəsinin yuxarısı",
        href: "/menziller",
        preview: { path: "/menziller" },
      },
      {
        key: "apartmentStatuses",
        title: "Statuslar",
        description: "Mənzil statuslarının saytda göstərilən adları.",
        where: "Mənzil kartları və statuslar siyahısı",
        href: "/menziller",
        preview: { path: "/menziller" },
      },
      {
        key: "apartmentFilters",
        title: "Filtrlər",
        description:
          "Filtr seçimləri. “match” dəqiq uyğunluq, “range” isə minimum/maksimum aralığıdır.",
        where: "Mənzillər səhifəsi, filtrlər sırası",
        href: "/menziller",
        preview: { path: "/menziller" },
      },
    ],
  },
  {
    group: "Ümumi",
    items: [
      {
        key: "footer",
        title: "Footer",
        description:
          "Bütün səhifələrin altındakı mətnlər, düymələr, zəng formu və keçidlər. Düymə stili: dark, light və ya outline.",
        where: "Bütün səhifələrin ən aşağısı",
        href: "/",
        preview: { path: "/" },
      },
      {
        key: "maintenance",
        title: "“Sayt hazırlanır” səhifəsi",
        description:
          "Tikinti rejimi açıq olanda ziyarətçilərin gördüyü səhifənin başlığı və mətni. Zəng forması, telefon və müəllif hüququ sətri Footer və Əlaqə bölmələrindən götürülür.",
        where: "Tikinti rejimi açıq olanda bütün sayt əvəzinə",
        href: "/maintenance/az",
        preview: { path: "/maintenance/az" },
      },
      {
        key: "seo",
        title: "Google və paylaşım",
        description: "Axtarış nəticələrində və link paylaşanda görünən başlıq və təsvirlər.",
        where: "Google axtarışı və mesajlarda link önizləməsi",
        href: null,
        preview: { page: "google" },
      },
    ],
  },
];

const FIELD_LABELS = {
  title: "Başlıq",
  subtitle: "Alt başlıq",
  description: "Təsvir",
  titleLines: "Başlıq sətirləri",
  descriptionLines: "Təsvir sətirləri",
  value: "Dəyər",
  label: "Etiket",
  name: "Ad",
  items: "Elementlər",
  stats: "Göstəricilər",
  features: "Kartlar",
  highlight: "Önə çıxan blok",
  photoCount: "Foto sayı",
  videoCount: "Video sayı",
  images: "Şəkillər",
  key: "Fayl açarı",
  alt: "Alternativ mətn",
  position: "Kəsim mövqeyi (CSS)",
  address: "Ünvan",
  origin: "Layihənin koordinatı",
  lat: "Enlik",
  lng: "Uzunluq",
  nearbyTitle: "Yaxınlıqda başlığı",
  nearby: "Yaxınlıqdakı məkanlar",
  location: "Koordinat",
  time: "Piyada vaxt",
  types: "Google Places tipləri",
  routeLabel: "Marşrut düyməsi",
  office: "Satış ofisi",
  details: "Məlumatlar",
  phoneHref: "Telefon linki",
  whatsappHref: "WhatsApp linki",
  faqTitle: "Suallar başlığı",
  faqs: "Tez-tez verilən suallar",
  question: "Sual",
  answer: "Cavab",
  meetingLabel: "Görüş düyməsi",
  formTitle: "Forma başlığı",
  planTitle: "Plan başlığı",
  currency: "Valyuta",
  price: "Mənzil dəyəri",
  downPayment: "İlkin ödəniş",
  months: "Müddət (ay)",
  featured: "Son yenilik",
  date: "Tarix",
  progressLabel: "İrəliləyiş etiketi",
  progress: "İrəliləyiş (%)",
  updates: "Yeniliklər",
  allUpdatesLabel: "“Bütün yeniliklər” düyməsi",
  floorLabel: "Mərtəbə etiketi",
  field: "Mənzil sahəsi (field)",
  type: "Tip (match / range)",
  defaultValue: "Standart seçim",
  options: "Seçimlər",
  min: "Minimum",
  max: "Maksimum",
  actions: "Düymələr",
  href: "Keçid (URL)",
  style: "Stil (dark / light / outline)",
  form: "Zəng formu",
  phoneLabel: "Telefon etiketi",
  submitLabel: "Göndər düyməsi",
  successMessage: "Uğurlu göndərmə mesajı",
  copyright: "Müəllif hüququ mətni",
  links: "Alt keçidlər",
  available: "Mövcud (available)",
  reserved: "Rezerv (reserved)",
  sold: "Satılıb (sold)",
};

const LONG_TEXT_KEYS = new Set(["description", "subtitle", "answer"]);

export function fieldLabel(key) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key];
  const words = String(key).replace(/([a-z0-9])([A-Z])/g, "$1 $2");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function isLongText(key, value) {
  return LONG_TEXT_KEYS.has(key) || (typeof value === "string" && value.length > 90);
}

// Same shape as `value`, with empty contents — used as the template for new list items.
export function blankLike(value) {
  if (Array.isArray(value)) return [];
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, inner]) => [key, blankLike(inner)]),
    );
  }
  if (typeof value === "number") return 0;
  if (typeof value === "boolean") return false;
  return "";
}

export function moveItem(list, from, to) {
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

// Short title for a collapsed list item.
export function itemSummary(item) {
  if (!item || typeof item !== "object") return "Element";
  if (item.value && item.label) return `${item.value} · ${item.label}`;
  for (const key of ["title", "label", "question", "name", "date", "value", "key", "id", "field"]) {
    const value = item[key];
    if ((typeof value === "string" && value.trim()) || typeof value === "number") {
      return String(value);
    }
  }
  return "Element";
}
