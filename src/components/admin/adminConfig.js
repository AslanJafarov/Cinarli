export const STORAGE_KEY = "cinarli-admin-draft-v1";

// Sidebar groups, in the order the data appears on the website.
// Any export in src/data/mock.js that is not listed here shows up under "Digər".
export const SECTION_GROUPS = [
  {
    group: "Ana səhifə",
    items: [
      {
        key: "projectStats",
        title: "Əsas göstəricilər",
        description: "Hero bölməsinin altındakı dörd rəqəm.",
      },
      {
        key: "projectFeatures",
        title: "Xüsusiyyət kartları",
        description: "Göstəricilərin altındakı üç kart.",
      },
      {
        key: "projectOverview",
        title: "Layihə",
        description: "“Layihə” bölməsinin başlığı, göstəriciləri və kartları.",
      },
      {
        key: "advantages",
        title: "Üstünlüklər",
        description: "Üstünlüklər bölməsinin başlığı və elementləri.",
      },
      {
        key: "locationInfo",
        title: "Yerləşmə",
        description: "Ünvan, xəritə koordinatları və yaxınlıqdakı məkanlar.",
      },
      {
        key: "gallery",
        title: "Qalereya",
        description: "Qalereya səhifəsinin fotoları: yeni foto yükləyin, lazımsızları silin və ardıcıllığı dəyişin.",
      },
      {
        key: "constructionProgress",
        title: "Tikintinin gedişi",
        description: "Son yenilik və tarix üzrə irəliləyiş faizləri.",
      },
      {
        key: "paymentCalculator",
        title: "Ödəniş kalkulyatoru",
        description: "Nümunə ödəniş planı üçün mətnlər və dəyərlər.",
      },
    ],
  },
  {
    group: "Mənzillər",
    items: [
      {
        key: "apartments",
        title: "Mənzillər",
        description:
          "Hər mənzilin plan şəkli, fotoları və mənzil səhifəsində göstərilən bütün məlumatları.",
      },
      {
        key: "apartmentPage",
        title: "Mənzillər səhifəsi",
        description: "Səhifə başlığı, alt başlıq və mərtəbə etiketi.",
      },
      {
        key: "apartmentStatuses",
        title: "Statuslar",
        description: "Mənzil statuslarının saytda göstərilən adları.",
      },
      {
        key: "apartmentFilters",
        title: "Filtrlər",
        description:
          "Filtr seçimləri. “match” dəqiq uyğunluq, “range” isə minimum/maksimum aralığıdır.",
      },
    ],
  },
  {
    group: "Əlaqə",
    items: [
      {
        key: "contactPage",
        title: "Əlaqə səhifəsi",
        description: "Satış ofisi məlumatları və tez-tez verilən suallar.",
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
