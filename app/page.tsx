import { cmsClient } from "@/lib/sleekcms";
import Link from "next/link";
import HomeHero from "@/components/HomeHero";
import { processDocSections, flattenTree } from "@/lib/doc-structure";

export default async function Home() {
  const client = cmsClient();

  // Parallel fetch: Home content, FAQs, and All Documentation pages
  const [homePage, faqsEntry, allDocs] = await Promise.all([
    client.getPage('/'),
    client.getEntry('faq'),
    client.getPages('/docs/')
  ]);

  const faqItems = (Array.isArray(faqsEntry)
    ? (faqsEntry[0]?.faqs || faqsEntry[0]?.items)
    : (faqsEntry?.faqs || faqsEntry?.items)
  ) || [];

  const faqTitle = Array.isArray(faqsEntry) ? faqsEntry[0]?.title : faqsEntry?.title;

  // Sort docs by order if available, otherwise default to 0
  const docs = (allDocs || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">

      {/* Hero Section with Integrated Navbar */}
      <HomeHero heroData={homePage || {}} />

      <main className="max-w-7xl mx-auto px-6 py-20 space-y-24">

        {/* Documentation Cards (Dynamic) */}
        {docs.length > 0 && (
          <section>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {docs.map((doc: any) => (
                <Link
                  key={doc._path}
                  href={doc._path}
                  className="group p-8 rounded-2xl border border-neutral-100 bg-white shadow-sm hover:shadow-xl hover:border-primary-100 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xl font-bold text-neutral-900 mb-4 group-hover:text-primary-600 transition-colors">
                      {doc.title}
                    </h3>
                    {doc.description && (
                      <p className="text-sm text-neutral-600 leading-relaxed line-clamp-3">
                        {doc.description.replace(/<[^>]+>/g, '')}
                      </p>
                    )}
                  </div>
                  <div className="mt-4 text-sm font-medium text-primary-600 group-hover:translate-x-1 transition-transform">
                    Read more &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* FAQs Section */}
        {faqItems.length > 0 && (
          <section className="max-w-3xl mx-auto">
            {faqTitle && (
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">{faqTitle}</h2>
              </div>
            )}
            <div className="space-y-4">
              {faqItems.map((faq: any, idx: number) => (
                <details
                  key={idx}
                  className="group bg-white border border-neutral-200 rounded-xl overflow-hidden open:ring-0 transition-all"
                >
                  <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors">
                    {faq.question}
                    <svg className="w-5 h-5 text-neutral-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-6 pb-6 pt-2 text-neutral-600 leading-relaxed animate-in fade-in slide-in-from-top-1 duration-200">
                    {faq.answer}
                  </div>
                </details>
              ))}
            </div>
          </section>
        )}
      </main>


    </div>
  );
}
