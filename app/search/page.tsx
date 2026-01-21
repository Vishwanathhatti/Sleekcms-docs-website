"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { createAsyncClient } from "@/lib/sleekcms-client";

// Simple client-side search for demonstration. 
// For production, consider server-side search or a search index like Algolia/Fuse.js.
const client = createAsyncClient({
    siteToken: process.env.NEXT_PUBLIC_SLEEK_TOKEN || "",
    resolveEnv: true,
    env: "latest", // We client-side fetch, this exposes token but it's public anyway
    cacheMinutes: 0,
});

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const initialQuery = searchParams.get("q") || "";

    const [query, setQuery] = useState(initialQuery);
    const [docs, setDocs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Fetch all docs once
        client.getPages("/docs/")
            .then((pages: any[]) => {
                setDocs(pages || []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newQuery = e.target.value;
        setQuery(newQuery);

        // Update URL without full reload
        const params = new URLSearchParams(searchParams);
        if (newQuery) {
            params.set("q", newQuery);
        } else {
            params.delete("q");
        }
        router.replace(`/search?${params.toString()}`);
    };

    const filteredDocs = docs.filter((doc) => {
        if (!query) return false;
        const q = query.toLowerCase();
        return (
            doc.title?.toLowerCase().includes(q) ||
            doc.description?.toLowerCase().includes(q)
            // Could search sections too if deeply nested
        );
    });

    return (
        <div className="min-h-screen bg-neutral-50 px-6 py-20">
            <div className="max-w-2xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-neutral-900 mb-4">Search Documentation</h1>
                    <p className="text-neutral-600">Find the answers you're looking for.</p>
                </div>

                <div className="relative mb-12">
                    <svg
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search for guides, API references..."
                        className="w-full pl-12 pr-4 py-4 rounded-xl border border-neutral-200 shadow-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-lg"
                        value={query}
                        onChange={handleSearchChange}
                        autoFocus
                    />
                </div>

                <div className="space-y-4">
                    {loading && (
                        <div className="text-center py-10">
                            <div className="animate-spin w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full mx-auto"></div>
                        </div>
                    )}

                    {!loading && query && filteredDocs.length === 0 && (
                        <div className="text-center py-10 text-neutral-500">
                            No results found for "{query}"
                        </div>
                    )}

                    {!loading && filteredDocs.map((doc) => (
                        <Link
                            key={doc._path}
                            href={doc._path}
                            className="block p-6 bg-white rounded-xl border border-neutral-200 hover:border-primary-300 hover:shadow-md transition-all group"
                        >
                            <h2 className="text-lg font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors mb-1">
                                {doc.title}
                            </h2>
                            {doc.description && (
                                <p className="text-neutral-500 text-sm line-clamp-2">
                                    {doc.description.replace(/<[^>]+>/g, '')} {/* Strip basic HTML tags */}
                                </p>
                            )}
                        </Link>
                    ))}

                    {!loading && !query && (
                        <div className="text-center py-10 text-neutral-400 text-sm">
                            Type to start searching...
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-neutral-50 px-6 py-20 text-center">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
