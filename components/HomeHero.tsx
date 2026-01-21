"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeHero({
    heroData
}: {
    heroData: any;
}) {
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Fallback image if not found in data
    // Data structure: heroData.hero.bg_img.url
    const bgImage = heroData?.hero?.bg_img?.url || "";

    return (
        <div className="relative w-full text-white">


            {/* Hero Content */}
            <div className="relative min-h-[600px] flex flex-col items-center justify-center px-6 pt-20 overflow-hidden bg-neutral-900">
                {/* Background Image/Overlay */}
                {bgImage && (
                    <div className="absolute inset-0 z-0">
                        <img
                            src={bgImage}
                            alt="Hero Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-neutral-900/60 mix-blend-multiply" />
                        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-transparent to-neutral-900/40" />
                    </div>
                )}

                <div className="relative z-10 max-w-4xl w-full text-center space-y-6">
                    {(heroData?.hero?.title || heroData?.title) && (
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                            {heroData?.hero?.title || heroData?.title}
                        </h1>
                    )}
                    {(heroData?.hero?.subtitle || heroData?.description) && (
                        <p className="text-xl text-white/80 max-w-2xl mx-auto">
                            {heroData?.hero?.subtitle || heroData?.description}
                        </p>
                    )}

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="max-w-2xl mx-auto mt-10 relative group">
                        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                            <svg className="w-5 h-5 text-white/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Search documentation..."
                            className="w-full pl-12 pr-24 py-4 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="absolute right-2 top-2 bottom-2 px-6 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-full transition-colors"
                        >
                            Search
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
