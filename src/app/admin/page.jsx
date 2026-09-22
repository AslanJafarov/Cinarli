import AdminApp from "@/components/admin/AdminApp";
import { requireAdmin } from "@/lib/auth";
import { translationSeed } from "@/i18n/content";
import { readLeads } from "@/lib/leads";
import { productionData, readStore } from "@/lib/store";

export const metadata = {
  title: "Admin panel",
  robots: { index: false, follow: false },
};

const page = async () => {
  await requireAdmin();
  const store = readStore();

  // A damaged leads.json must not lock the admin out of everything else.
  let initialLeads = [];
  let leadsError = null;
  try {
    initialLeads = await readLeads();
  } catch (error) {
    console.error("[leads] could not be read", error);
    leadsError =
      "Müraciətlər faylı (leads.json) oxunmadı. Faylı yoxlayın: yeni müraciətlər düzələnə qədər saxlanılmır.";
  }

  // The panel always edits the real (production) data; the mode decides what the site shows.
  return (
    <AdminApp
      initialData={productionData(store.data)}
      // Sample translations first, then whatever was saved over them.
      initialTranslations={{
        ru: { ...translationSeed("ru"), ...store.translations.ru },
        en: { ...translationSeed("en"), ...store.translations.en },
      }}
      initialLeads={initialLeads}
      leadsError={leadsError}
      initialMode={store.mode}
      initialSavedAt={store.savedAt}
      initialRevision={store.revision}
    />
  );
};

export default page;
