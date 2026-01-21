
import Link from "next/link";
import { cmsClient } from "@/lib/sleekcms";
import { notFound } from "next/navigation";
import DocsSidebar from "@/components/DocsSidebar";

export const fetchCache = "force-no-store";
export const dynamic = "force-dynamic";

import { processDocSections, flattenTree } from "@/lib/doc-structure";

// ... existing imports

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const client = cmsClient();
    const allDocs = await client.getPages("/docs/");

    // Sort docs by order
    allDocs.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    const currentDoc = allDocs.find((doc: any) => doc.slug === slug);

    if (!currentDoc) {
        notFound();
    }

    // Process sections to get numbering and hierarchy for ALL docs
    const processedDocs = allDocs.map((doc: any) => {
        const rawSections = doc.sections?.filter((s: any) => s.title && s.title.trim().length > 0) || [];
        return {
            ...doc,
            sectionTree: processDocSections(rawSections)
        };
    });

    // Get the current doc from the processed list to use its tree for main content
    const currentProcessedDoc = processedDocs.find((d: any) => d.slug === slug);

    // For main content rendering, flatten the tree of the CURRENT doc
    const flatProcessedSections = flattenTree(currentProcessedDoc.sectionTree);

    return (
        <div className="flex flex-col md:flex-row gap-12 relative max-w-7xl mx-auto px-6 py-12">
            {/* Sidebar */}
            <aside className="w-full md:w-64 mt-10 md:mt-0  flex-shrink-0">
                <div className="sticky top-24 max-h-[calc(100vh-8rem)] overflow-y-auto">
                    <DocsSidebar
                        docs={processedDocs}
                        currentSlug={slug}
                    />
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                <article className="prose max-w-none">
                    <h1>{currentDoc.title}</h1>

                    {currentDoc.description && (
                        <div dangerouslySetInnerHTML={{ __html: currentDoc.description }} />
                    )}

                    <div className="mt-8 space-y-12">
                        {flatProcessedSections.map((section, idx) => (
                            <div key={section.id} id={section.slug} className="scroll-mt-24">
                                {section.title && (
                                    // Use distinct styling for different levels? 
                                    // Or rely on the prose h2/h3 styles? 
                                    // Since we flattened, we just render H2 for all? Or map level to H tag?
                                    // Given the user screenshot shows distinct H2/H3 looking things, 
                                    // mapping level to tag is better.
                                    <>
                                        {section.level === 1 && <h2>{section.title}</h2>}
                                        {section.level === 2 && <h3>{section.title}</h3>}
                                        {section.level >= 3 && <h4>{section.title}</h4>}
                                    </>
                                )}
                                {section.content && (
                                    <div dangerouslySetInnerHTML={{ __html: section.content }} />
                                )}
                            </div>
                        ))}
                    </div>
                </article>
            </div>
        </div>
    );
}
