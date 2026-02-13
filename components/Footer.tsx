import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/10 bg-slate-950/50 backdrop-blur-md mt-auto">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-white font-semibold text-lg tracking-tight">Vedic Astra</span>
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap justify-center gap-6 text-sm text-white/60">
                        <Link href="/disclaimer" className="hover:text-purple-300 transition-colors">
                            Disclaimer
                        </Link>
                        <Link href="/privacy" className="hover:text-purple-300 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-purple-300 transition-colors">
                            Terms of Use
                        </Link>
                    </div>

                    {/* Copyright */}
                    <div className="text-xs text-white/40">
                        &copy; {new Date().getFullYear()} Vedic Astra. All rights reserved.
                    </div>
                </div>
            </div>
        </footer>
    );
}
