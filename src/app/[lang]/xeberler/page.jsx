import Image from "next/image";
import Link from "next/link";
import EmptyNotice from "@/components/EmptyNotice";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import { localizeHref } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { blurPlaceholder } from "@/lib/galleryPhotos";
import { formatNewsDate, newsCover, publishedNews } from "@/lib/news";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const { seo } = getContent(lang);

  return pageMetadata({ locale: lang, ...seo.news, path: "/xeberler" });
}

const page = async ({ params }) => {
  const { lang } = await params;
  const { news, ui } = getContent(lang);
  const t = ui.news;
  const items = publishedNews(news);

  return (
    <>
      <Navbar variant="dark" />
      <main
        data-admin-preview="news"
        className="flex-1 bg-[#f3f0e9] px-page pb-[clamp(56px,6vw,120px)] pt-[clamp(28px,3.2vw,64px)] text-[#16201b]"
      >
        <h1 className="text-[clamp(34px,4vw,76px)] leading-[1.08]">{t.title}</h1>
        <p className="mt-[clamp(8px,0.8vw,16px)] max-w-[44em] text-[clamp(15px,1.25vw,24px)] text-[#6c6b65]">
          {t.subtitle}
        </p>

        {items.length === 0 ? (
          <EmptyNotice
            icon="news"
            title={t.emptyTitle}
            text={t.emptyText}
            className="mt-[clamp(24px,2.6vw,52px)]"
          />
        ) : (
          <ul className="mt-[clamp(28px,3vw,60px)] grid gap-[clamp(16px,1.6vw,32px)] sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item, index) => {
              const cover = newsCover(item);
              const href = localizeHref(lang, `/xeberler/${item.id}`);
              return (
                <li key={item.id}>
                  <Link
                    href={href}
                    className="group flex h-full flex-col overflow-hidden rounded-[clamp(18px,1.6vw,30px)] bg-white transition-shadow hover:shadow-[0_12px_32px_rgba(22,32,27,0.10)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-[#24503a]">
                      {cover && (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          placeholder={blurPlaceholder(cover)}
                          preload={index === 0}
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                          className="object-cover transition-[scale] duration-700 ease-butter group-hover:scale-[1.04] motion-reduce:transition-none"
                        />
                      )}
                    </div>
                    <div className="flex flex-1 flex-col p-[clamp(18px,1.6vw,32px)]">
                      <time dateTime={item.date} className="text-[clamp(12px,0.85vw,16px)] text-[#2a5a40]">
                        {formatNewsDate(item.date, lang)}
                      </time>
                      <h2 className="mt-2 text-[clamp(19px,1.45vw,28px)] font-bold leading-tight">
                        {item.title}
                      </h2>
                      {item.summary && (
                        <p className="mt-2 text-[clamp(14px,1vw,19px)] leading-relaxed text-[#6c6b65]">
                          {item.summary}
                        </p>
                      )}
                      <span className="mt-auto pt-4 text-[clamp(12px,0.85vw,16px)] font-bold uppercase tracking-[0.04em] text-[#24503a]">
                        {t.readMore} <span aria-hidden="true">→</span>
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
      <Footer />
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: ui.seo.breadcrumbHome, path: localizeHref(lang, "/") },
            { name: t.breadcrumb, path: localizeHref(lang, "/xeberler") },
          ]),
        ]}
      />
    </>
  );
};

export default page;
