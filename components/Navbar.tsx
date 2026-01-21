"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
    navbarItems: any[];
    brandTitle?: string;
}

export default function Navbar({ navbarItems = [], brandTitle = "SleekSky" }: NavbarProps) {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isHome && !scrolled && !mobileMenuOpen ? "bg-transparent py-5" : "bg-[#220E46]/95 backdrop-blur-md shadow-md py-3"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6">
                <div className="flex items-center justify-between">
                    <a href="/" className="flex items-center gap-2 relative z-50">
                        {/* Logo Icon Placeholder */}
                        <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full" />
                        </div>
                        {/* Brand Title */}
                        <span className="text-lg font-bold tracking-tight text-white transition-colors">{brandTitle}</span>
                    </a>

                    {/* Desktop Navigation */}
                    <nav className="hidden md:flex gap-8">
                        {navbarItems.map((item: any, idx: number) => (
                            <Link
                                key={idx}
                                href={item.url || '#'}
                                className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                            >
                                {item.name || item.label}
                            </Link>
                        ))}
                    </nav>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="md:hidden relative z-50 p-2 text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {mobileMenuOpen && (
                    <div className="md:hidden absolute inset-x-0 top-full bg-[#220E46] border-t border-white/10 shadow-xl p-6 flex flex-col gap-4 animate-in slide-in-from-top-5 fade-in duration-200">
                        {navbarItems.map((item: any, idx: number) => (
                            <Link
                                key={idx}
                                href={item.url || '#'}
                                className="text-base font-semibold text-white/90 hover:text-white py-2 block border-b border-white/5 last:border-0"
                            >
                                {item.name || item.label}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </header>
    );
}
