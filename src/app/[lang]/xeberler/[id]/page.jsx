import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import Navbar from "@/components/Navbar";
import { localizeHref } from "@/i18n/config";
import { getContent } from "@/i18n/content";
import { blurPlaceholder } from "@/lib/galleryPhotos";
import { formatNewsDate, newsCover, newsParagraphs, publishedNews } from "@/lib/news";
import { absoluteUrl, breadcrumbJsonLd, pageMetadata } from "@/lib/seo";

const findNews = (lang, id) =>
  publishedNews(getContent(lang).news).find((item) => item.id === id);

// News added later in the admin panel are rendered on their first visit.
export function generateStaticParams({ params }) {
  return publishedNews(getContent(params.lang).news).map(({ id }) => ({ id }));
}

export async function generateMetadata({ params }) {
  const { lang, id } = await params;
  const item = findNews(lang, id);
  if (!item) return { title: getContent(lang).ui.notFound.metaTitle };

  return pageMetadata({
    locale: lang,
    title: item.title,
    description: item.summary || item.title,
    path: `/xeberler/${item.id}`,
  });
}

const page = async ({ params }) => {
  const { lang, id } = await params;
  const item = findNews(lang, id);
  if (!item) notFound();

  const { news, seo, ui } = getContent(lang);
  const t = ui.news;
  const cover = newsCover(item);
  const others = publishedNews(news).filter((other) => other.id !== item.id).slice(0, 3);
  const path = localizeHref(lang, `/xeberler/${item.id}`);

  return (
    <>
      <Navbar variant="dark" />
      <main className="flex-1 bg-[#f3f0e9] px-page pb-[clamp(56px,6vw,120px)] pt-[clamp(28px,3.2vw,64px)] text-[#16201b]">
        <Link
          href={localizeHref(lang, "/xeberler")}
          className="inline-flex items-center gap-[clamp(6px,0.5vw,10px)] rounded-full bg-[#e8e4da] py-[clamp(10px,0.6vw,12px)] pl-[clamp(12px,0.9vw,16px)] pr-[clamp(16px,1.2vw,22px)] text-[clamp(14px,0.95vw,18px)] font-bold transition-colors hover:bg-[#ddd8cc]"
        >
          <svg aria-hidden="true" viewBox="0 0 8 14" className="h-[clamp(11px,0.8vw,15px)] w-auto">
            <path d="M7 1 1 7l6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t.back}
        </Link>

        <article className="mx-auto mt-[clamp(28px,3.2vw,64px)] max-w-[860px]">
          <time dateTime={item.date} className="text-[clamp(13px,0.95vw,18px)] text-[#2a5a40]">
            {formatNewsDate(item.date, lang)}
          </time>
          <h1 className="mt-3 text-balance text-[clamp(30px,3.2vw,60px)] font-bold leading-[1.1]">
            {item.title}
          </h1>
          {item.summary && (
            <p className="mt-4 text-[clamp(17px,1.35vw,25px)] leading-relaxed text-[#6c6b65]">
              {item.summary}
            </p>
          )}

          {cover && (
            <div className="relative mt-[clamp(24px,2.6vw,52px)] aspect-[16/9] overflow-hidden rounded-[clamp(18px,1.6vw,30px)] bg-[#24503a]">
              <Image
                src={cover}
                alt=""
                fill
                preload
                placeholder={blurPlaceholder(cover)}
                sizes="(min-width: 900px) 860px, 100vw"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-[clamp(24px,2.6vw,52px)] space-y-5 text-[clamp(16px,1.15vw,21px)] leading-[1.75]">
            {newsParagraphs(item.body).map((paragraph, index) => (
              <p key={index} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        {others.length > 0 && (
          <section aria-labelledby="other-news" className="mx-auto mt-[clamp(48px,5vw,100px)] max-w-[860px]">
            <h2 id="other-news" className="text-[clamp(20px,1.8vw,34px)] font-bold">
              {t.others}
            </h2>
            <ul className="mt-4 divide-y divide-[#16201b]/10 border-y border-[#16201b]/10">
              {others.map((other) => (
                <li key={other.id}>
                  <Link
                    href={localizeHref(lang, `/xeberler/${other.id}`)}
                    className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 transition-colors hover:text-[#24503a]"
                  >
                    <span className="text-[clamp(16px,1.2vw,22px)] font-bold">{other.title}</span>
                    <time dateTime={other.date} className="text-[clamp(13px,0.9vw,17px)] text-[#6c6b65]">
                      {formatNewsDate(other.date, lang)}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </main>
      <Footer />
      <JsonLd
        data={[
          {
            "@type": "NewsArticle",
            headline: item.title,
            description: item.summary || undefined,
            datePublished: item.date,
            inLanguage: lang,
            url: absoluteUrl(path),
            image: cover ? [absoluteUrl(cover.src)] : undefined,
            publisher: { "@type": "Organization", name: seo.siteName },
          },
          breadcrumbJsonLd([
            { name: ui.seo.breadcrumbHome, path: localizeHref(lang, "/") },
            { name: t.breadcrumb, path: localizeHref(lang, "/xeberler") },
            { name: item.title, path },
          ]),
        ]}
      />
    </>
  );
};

export default page;
