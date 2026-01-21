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
    const pathname = usePathname();
    const isHome = pathname === "/";

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${isHome && !scrolled ? "bg-transparent py-5" : "bg-neutral-900/90 backdrop-blur-md shadow-md py-3"
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                <a href="/" className="flex items-center gap-2">
                    {/* Logo Icon Placeholder */}
                    <div className="w-8 h-8 rounded-full border-2 border-white/20 flex items-center justify-center">
                        <div className="w-2 h-2 bg-red-500 rounded-full" />
                    </div>
                    {/* Brand Title */}
                    <span className="text-lg font-bold tracking-tight text-white">{brandTitle}</span>
                </a>

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
            </div>
        </header>
    );
}
