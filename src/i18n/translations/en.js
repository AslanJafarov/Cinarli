// English text only. Arrays line up with src/data/mock.js by position;
// `{}` keeps the Azerbaijani value for that position.
const en = {
  ui: {
    meta: {
      homeTitle: "Çınarlı Park",
      homeDescription:
        "Çınarlı Park is a residential complex that balances family life, a green courtyard and easy access to the city.",
      apartmentsTitle: "Choose your apartment | Çınarlı Park",
      contactTitle: "Contact | Çınarlı Park",
      apartmentTitle: "{id} | Çınarlı Park",
      apartmentNotFound: "Apartment not found | Çınarlı Park",
    },
    common: {
      rooms: { one: "{count} room", other: "{count} rooms" },
      minutes: { other: "{count} min" },
      months: { one: "{count} month", other: "{count} months" },
      area: "{value} m²",
    },
    nav: {
      items: {
        layihe: "Project",
        menziller: "Apartments",
        ustunlukler: "Advantages",
        yerlesme: "Location",
        qalereya: "Gallery",
      },
      consult: "Get advice",
      menu: "Menu",
      close: "Close",
      menuLabel: "Menu",
      call: "Call",
      language: "Language",
    },
    hero: {
      imageAlt: "Çınarlı Park residential complex",
      titleLines: ["In the city.", "Closer to nature."],
      description:
        "Çınarlı Park is a residential complex that balances family life, a green courtyard and easy access to the city.",
      primary: "Choose an apartment",
      secondary: "Explore the project",
    },
    quickSearch: {
      rooms: "Rooms",
      area: "Area",
      floor: "Floor",
      all: "All",
    },
    overview: {
      imageAlt: "Çınarlı Park buildings",
      apartmentsButton: "View apartments",
      locationButton: "Location",
    },
    advantages: {
      imageAlt: "Modern residential building among trees",
    },
    location: {
      mapTitle: "Çınarlı Park on the map — {address}",
    },
    gallery: {
      photos: "photos",
      videos: "videos",
      back: "Home",
      all: "All",
      filter: "Filter by category",
      open: "Open photo",
      close: "Close",
      previous: "Previous photo",
      next: "Next photo",
    },
    construction: {
      imageAlt: "Residential building under construction",
    },
    payment: {
      price: "Apartment price",
      downPayment: "Down payment",
      term: "Term",
      monthsUnit: "months",
      calculate: "Calculate",
      monthly: "monthly payment",
      remaining: "Remaining amount",
      talkToManager: "Talk to a sales manager",
    },
    apartments: {
      floorSummary: { other: "floor {count}" },
      filters: "Filters",
      view: "View",
      selected: "Selected apartment",
      floor: "Floor",
      balcony: "Balconies",
      renovation: "Finishing",
      status: "Status",
      apply: "Request this apartment",
      emptyTitle: "No apartments match the selected filters",
      emptyText: "Change or reset the filters.",
      reset: "Reset filters",
    },
    planCard: {
      roomsWord: { one: "ROOM", other: "ROOMS" },
      planAlt: "Floor plan of a {count}-room apartment",
    },
    apartment: {
      back: "Apartments",
      roomsTitle: "{count}-room apartment",
      unit: "Apartment {unit}",
      about: "About the apartment",
      totalArea: "Total area",
      others: "Other apartments",
      paymentTitle: "Calculate your payment",
      calculator: "Payment calculator",
      talkToManager: "Talk to a sales manager",
    },
    leadBar: {
      title: "Like this apartment?",
      text: "Leave your phone number and our team will get in touch.",
      phoneLabel: "Phone number",
      submit: "Send",
      close: "Close",
    },
    mobileBar: {
      call: "Call",
      primary: "Apartments",
    },
    contact: {
      back: "Home",
    },
    footer: {
      navLabel: "Site links",
    },
    seo: {
      ogLocale: "en_US",
      apartmentTitle:
        "{rooms}-room apartment, {area} m² — Building {building}, floor {floor}",
      apartmentDescription:
        "{rooms}-room apartment of {area} m² at {siteName}: Building {building}, floor {floor}, balconies: {balconies}, finishing: {renovation}. Status: {status}. Floor plan and room areas.",
      breadcrumbHome: "Home",
      breadcrumbApartments: "Apartments",
      breadcrumbContact: "Contact",
      breadcrumbGallery: "Gallery",
      ogSubtitle: "{location} · new residential complex",
      ogButton: "CHOOSE AN APARTMENT",
      ogApartmentMeta: "Building {building} · floor {floor} · Apartment {unit}",
    },
    notFound: {
      title: "Page not found.",
      text: "The page you're looking for doesn't exist or has moved.",
      metaTitle: "Page not found",
      home: "Home",
      apartments: "Apartments",
      contact: "Contact",
    },
    leadForm: {
      invalidPhone: "Enter the full number, e.g. 50 123 45 67.",
      failed: "Couldn't send. Please try again in a moment.",
      sending: "Sending…",
      sendAnother: "Send another number",
    },
  },

  apartmentTerms: {
    "1 balkon": "1 balcony",
    "2 balkon": "2 balconies",
    "Geniş zal": "Spacious living room",
    "Ailə planlaması": "Family layout",
    "Uşaq otağı": "Children's room",
    Təmirli: "Renovated",
    "Kompakt planlama": "Compact layout",
    "Künc mənzil": "Corner apartment",
    "Həyətə baxış": "Courtyard view",
    "Seçimə görə": "Buyer's choice",
    "Qara karkas": "Shell and core",
    "Ağ karkas": "White box",
    "Zal + mətbəx": "Living room + kitchen",
    "Yataq otağı": "Bedroom",
    Zal: "Living room",
    "Qonaq otağı": "Living room",
    Mətbəx: "Kitchen",
    Holl: "Hall",
    Balkon: "Balcony",
    "Sanitar qovşağı": "Bathroom",
    "Sanitar qovşağı 1": "Bathroom 1",
    "Sanitar qovşağı 2": "Bathroom 2",
    "2 sanitar qovşağı": "2 bathrooms",
    "Geniş holl": "Spacious hall",
    "Geniş qonaq otağı": "Spacious living room",
  },

  projectStats: [
    { label: "buildings" },
    { label: "enclosed courtyard" },
    { label: "apartments" },
    { value: "2 levels", label: "underground parking" },
  ],

  projectFeatures: [
    {
      title: "Apartment finder",
      description: "Live filtering by rooms, area, floor and status.",
    },
    {
      title: "Green living",
      description: "A car-free courtyard, family areas and everyday comfort.",
    },
    {
      title: "Quick contact",
      description: "WhatsApp, a call, a request or a sales manager — in one click.",
    },
  ],

  apartmentPage: {
    title: "Choose your apartment",
    subtitle: "Filter and compare available apartments with ease.",
    floorLabel: "Building {building} · floor {floor}",
  },

  apartmentStatuses: {
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
  },

  apartmentFilters: [
    {
      label: "Building",
      options: [{ label: "All" }, { label: "Building A" }, { label: "Building B" }],
    },
    { label: "Rooms", options: [{ label: "All" }] },
    {
      label: "Area",
      options: [
        { label: "All" },
        { label: "up to 90 m²" },
        {},
        { label: "over 115 m²" },
      ],
    },
    { label: "Floor", options: [{ label: "All" }] },
    {
      label: "Status",
      options: [
        { label: "All" },
        { label: "Available" },
        { label: "Reserved" },
        { label: "Sold" },
      ],
    },
  ],

  advantages: {
    titleLines: ["Advantages designed", "for everyday comfort."],
    description: "Not just a building — an environment planned for family life.",
    highlight: {
      title: "Car-free green courtyard",
      descriptionLines: ["Safer for children,", "calmer for the whole family."],
    },
    items: [
      {
        value: "2 levels",
        label: "Underground parking",
        description: "A practical solution for comfortable living.",
      },
      {
        label: "Security",
        description: "A practical solution for comfortable living.",
      },
      {
        value: "Family zones",
        label: "Play and relaxation areas",
        description: "A practical solution for comfortable living.",
      },
      {
        value: "Green spaces",
        label: "The heart of the courtyard",
        description: "A practical solution for comfortable living.",
      },
    ],
  },

  gallery: {
    title: "See the project up close.",
    subtitle: "Exterior, courtyard, floor plans and the atmosphere of the project.",
    images: [
      { alt: "Residential building surrounded by greenery" },
      { alt: "Facade of a residential building with balconies" },
      { alt: "Bright living room interior" },
      { alt: "3D apartment floor plan" },
      { alt: "Modern residential building with green balconies" },
    ],
    pageTitle: "Gallery",
    pageSubtitle:
      "Exterior, interiors, balconies and floor plans — every photo of the project in one place.",
    categories: [
      { label: "Exterior" },
      { label: "Interior" },
      { label: "Balconies & courtyard" },
      { label: "Floor plans" },
    ],
    // Same order as gallery.photos in src/data/mock.js.
    photos: [
      { alt: "Residential building surrounded by greenery" },
      { alt: "Spacious living room in light tones" },
      { alt: "White residential building with green terraces" },
      { alt: "Modern kitchen with marble surfaces" },
      { alt: "Green balcony with a glass railing" },
      { alt: "Çınarlı Park residential complex" },
      { alt: "Minimalist living room" },
      { alt: "Modern residential building with green balconies" },
      { alt: "Bedroom with indoor plants" },
      { alt: "Facade with glass balconies" },
      { alt: "Balcony corner with a table and chairs" },
      { alt: "Bright living room interior" },
      { alt: "Modern residential building among trees" },
      { alt: "Galley kitchen opening onto a garden" },
      { alt: "Residential building with balconies at sunset" },
      { alt: "Living room with a green sofa" },
      { alt: "Facade of a residential building with balconies" },
      { alt: "Balcony full of plants" },
      { alt: "Dining area next to the kitchen" },
      { alt: "Modern beige facade" },
      { alt: "Living room open to the kitchen" },
      { alt: "White multi-storey building" },
      { alt: "3D apartment floor plan" },
    ],
  },

  locationInfo: {
    title: "Close to everything.",
    description: "A city location that shortens your daily routes.",
    nearbyTitle: "Nearby",
    nearby: [
      {
        label: "Metro / transport",
        name: "Azadliq Avenue metro station",
        time: "12 min",
      },
      { label: "School", name: "School No. 244", time: "5 min" },
      { label: "Supermarket", name: "Araz Supermarket", time: "6 min" },
      { label: "Park", name: "Azadliq Avenue Park", time: "17 min" },
      { label: "Clinic", name: "Lachin Medical Center", time: "7 min" },
    ],
    routeLabel: "Directions to the sales office",
  },

  contactPage: {
    titleLines: ["Have a question?", "Talk to our team."],
    office: {
      label: "Sales office",
      details: [
        { label: "Phone" },
        { label: "WhatsApp", value: "Message us in one click" },
        { label: "Opening hours" },
        { label: "Address" },
      ],
    },
    faqTitle: "Frequently asked questions",
    faqs: [
      {
        question: "How is the apartment price calculated?",
        answer:
          "The price depends on the area, floor, view and finishing option. Our sales manager will give you the exact price of the apartment you choose.",
      },
      {
        question: "What is the down payment?",
        answer:
          "The down payment starts at 20% of the apartment price. The rest can be paid in interest-free instalments over up to 36 months.",
      },
      {
        question: "Can I reserve an apartment online?",
        answer:
          "Yes. Choose an apartment and send a request — our manager will contact you, and the apartment will be reserved in your name for 3 business days.",
      },
      {
        question: "Are renovated apartments available?",
        answer:
          "Yes. Apartments are available as shell and core, white box or fully finished. We share details about finishing packages at the sales office.",
      },
      {
        question: "When will construction be completed?",
        answer:
          "Phase one is scheduled for handover in Q4 2027, and phase two by the end of 2028.",
      },
    ],
    meetingLabel: "Book a meeting",
  },

  paymentCalculator: {
    title: "Calculate your payment.",
    subtitle: "See a sample payment plan for your chosen apartment in seconds.",
    formTitle: "Payment calculator",
    planTitle: "Sample plan",
  },

  constructionProgress: {
    title: "Construction progress.",
    subtitle: "Follow the progress transparently, date by date.",
    featured: {
      date: "September 2026",
      title: "Building B — facade and interior works",
      progressLabel: "Overall progress",
    },
    updates: [
      { date: "August 2026", title: "Building A" },
      { date: "July 2026", title: "Underground parking" },
      { date: "June 2026", title: "Courtyard infrastructure" },
      { date: "May 2026", title: "Building C" },
    ],
    allUpdatesLabel: "All updates",
  },

  quickSearch: {
    title: "Quick apartment search",
    buttonLabel: "Show available apartments",
  },

  footer: {
    title: "In the city. Closer to nature.",
    subtitle: "A digital experience built for choosing and buying your home.",
    description:
      "Leave your number — our sales team will contact you during working hours.",
    actions: [
      { label: "Choose an apartment" },
      { label: "Get advice" },
      { label: "Location" },
    ],
    form: {
      title: "We'll call you",
      phoneLabel: "Phone number",
      submitLabel: "Send",
      successMessage: "Thank you! Our sales team will contact you shortly.",
    },
    copyright: "Çınarlı Park. All rights reserved.",
    links: [
      { label: "Project" },
      { label: "Apartments" },
      { label: "Gallery" },
      { label: "Contact" },
      {},
      {},
    ],
  },

  seo: {
    tagline: "In the city. Closer to nature.",
    locationLabel: "Baku, Binagadi district",
    home: {
      title: "Çınarlı Park — new-build apartments in Baku",
      description:
        "Çınarlı Park is a new residential complex with a green, car-free courtyard in Baku's Binagadi district. 2- and 3-room apartments, underground parking, close to the metro.",
    },
    apartments: {
      title: "Apartments — 2- and 3-room new-build apartments",
      description:
        "Choose apartments at Çınarlı Park by rooms, area, floor and status: floor plans, room areas and availability.",
    },
    contact: {
      title: "Contact — sales office",
      description:
        "Çınarlı Park sales office: phone, WhatsApp, opening hours and address. FAQs about price, down payment and reservations.",
    },
    gallery: {
      title: "Gallery — project photos",
      description:
        "Çınarlı Park photo gallery: building exteriors, apartment interiors, balconies, courtyard and floor plans.",
    },
  },

  projectOverview: {
    titleLines: ["In the city.", "Closer to nature."],
    description:
      "Çınarlı Park is a modern residential complex that brings together city convenience, family life and greenery.",
    stats: [
      { label: "buildings" },
      { label: "apartments" },
      { label: "enclosed courtyard" },
      { value: "2 levels", label: "underground parking" },
    ],
    features: [
      {
        title: "Designed for families",
        description: "A spacious courtyard, play areas and a quiet interior space.",
      },
      {
        title: "Green living",
        description: "A car-free courtyard and greenery every day.",
      },
      {
        title: "Close to the city",
        description: "Easy access to work, schools and services.",
      },
    ],
  },
};

export default en;
