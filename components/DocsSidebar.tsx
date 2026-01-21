"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { ProcessedSection } from "@/lib/doc-structure";
import { usePathname } from "next/navigation";

// Component for a single recursive item in the section tree
const SidebarSection = ({ section, depth = 0 }: { section: ProcessedSection; depth?: number }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = section.children && section.children.length > 0;

    const toggleExpand = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsExpanded(!isExpanded);
    };

    return (
        <div className="relative">
            <div
                className={`
          flex items-center justify-between group py-1.5 pr-2 rounded-md transition-all duration-200
          ${depth > 0 ? "ml-4" : ""}
        `}
            >
                <Link
                    href={`#${section.slug}`}
                    className="flex-1 flex items-baseline gap-2 text-sm text-neutral-600 hover:text-primary-600 transition-colors truncate"
                    title={section.title}
                >
                    <span className="font-mono text-xs opacity-50 shrink-0 select-none text-primary-500/70">{section.number}</span>
                    <span className={`${depth === 0 ? "font-medium" : "font-normal"} truncate`}>{section.originalTitle}</span>
                </Link>

                {hasChildren && (
                    <button
                        onClick={toggleExpand}
                        className={`
              shrink-0 ml-1 p-0.5 rounded-md text-neutral-400 hover:text-primary-600 hover:bg-primary-50 transition-all focus:outline-none
              ${isExpanded ? "transform rotate-90" : ""}
            `}
                        aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div className="relative border-l border-neutral-200/60 ml-[0.8rem] pl-1 animate-in fade-in slide-in-from-top-1 duration-200">
                    {section.children.map((child) => (
                        <SidebarSection key={child.id} section={child} depth={depth + 1} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function DocsSidebar({
    docs,
    currentSlug,
}: {
    docs: any[];
    currentSlug: string;
}) {
    const [expandedDocs, setExpandedDocs] = useState<Set<string>>(new Set([currentSlug]));
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const pathname = usePathname();

    // Close mobile menu on path change
    useEffect(() => {
        setIsMobileOpen(false);
    }, [pathname]);

    const toggleDocExpand = (slug: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setExpandedDocs((prev) => {
            const next = new Set(prev);
            if (next.has(slug)) {
                next.delete(slug);
            } else {
                next.add(slug);
            }
            return next;
        });
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <div className="md:hidden mb-6">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="w-full flex items-center justify-between px-4 py-3 bg-white border border-neutral-200 rounded-xl shadow-sm active:scale-[0.99] transition-all"
                >
                    <span className="font-semibold text-neutral-800">Menu</span>
                    <svg
                        className={`w-6 h-6 text-neutral-500 transition-transform ${isMobileOpen ? "rotate-180" : ""}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        {isMobileOpen ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        )}
                    </svg>
                </button>
            </div>

            {/* Sidebar Container - Mobile: absolute/fixed styled, Desktop: static/block */}
            <nav
                className={`
          flex flex-col space-y-2
          ${isMobileOpen ? "block" : "hidden md:flex"}
        `}
            >
                {docs.map((doc: any) => {
                    const isActive = doc.slug === currentSlug;
                    const isExpanded = expandedDocs.has(doc.slug);
                    const hasSections = doc.sectionTree && doc.sectionTree.length > 0;

                    return (
                        <div key={doc._path} className="select-none">
                            <div
                                className={`
                  group flex items-center justify-between py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer border
                  ${isActive
                                        ? "bg-primary-50 border-primary-100 text-primary-900 shadow-sm"
                                        : "bg-transparent border-transparent text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900"
                                    }
                `}
                            >
                                <Link href={doc._path} className="flex-1 font-medium truncate">
                                    {doc.title}
                                </Link>

                                {hasSections && (
                                    <button
                                        onClick={(e) => toggleDocExpand(doc.slug, e)}
                                        className={`
                      ml-2 p-1 rounded-md transition-all focus:outline-none
                      ${isActive
                                                ? "text-primary-500 hover:bg-primary-100"
                                                : "text-neutral-400 hover:bg-neutral-200 hover:text-neutral-600"
                                            }
                      ${isExpanded ? "transform rotate-90" : ""}
                    `}
                                        aria-label={isExpanded ? "Collapse" : "Expand"}
                                    >
                                        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                )}
                            </div>

                            {/* Sections Area */}
                            {hasSections && isExpanded && (
                                <div className="mt-2 mb-3 ml-2 pl-3 border-l-2 border-neutral-100 space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {doc.sectionTree.map((section: ProcessedSection) => (
                                        <SidebarSection key={section.id} section={section} />
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>
        </>
    );
}
