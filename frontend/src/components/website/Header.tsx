"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Menu, X } from "lucide-react";

export default function Header() {
    const [mobileOpen, setMobileOpen] = useState(false);

    const navLinks = [
        { name: "Home", href: "/" },
        { name: "Platform", href: "#platform" },
        { name: "Features", href: "#features" },
        { name: "Pricing", href: "#pricing" },
    ];

    return (
        <header className="sticky top-0 z-50 bg-white shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center space-x-2">
                        <Image
                            src="/logo.png"
                            alt="Carlhub Logo"
                            width={32}
                            height={32}
                            priority
                        />
                        <h1 className="text-xl font-bold">Carlhub</h1>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex space-x-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-gray-700 hover:text-blue-600 transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}
                    </nav>

                    {/* Auth Buttons */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/login"
                            className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 hover:bg-blue-50 transition"
                        >
                            Login
                        </Link>
                        <Link
                            href="/signup"
                            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                        onClick={() => setMobileOpen(!mobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Nav */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-t border-gray-200">
                    <nav className="flex flex-col px-4 py-3 space-y-2">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="block text-gray-700 hover:text-blue-600 transition-colors"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.name}
                            </Link>
                        ))}
                        <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                            <Link
                                href="/login"
                                className="px-4 py-2 rounded-md border border-blue-600 text-blue-600 text-center hover:bg-blue-50 transition"
                                onClick={() => setMobileOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                href="/signup"
                                className="px-4 py-2 rounded-md bg-blue-600 text-white text-center hover:bg-blue-700 transition"
                                onClick={() => setMobileOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    );
}
