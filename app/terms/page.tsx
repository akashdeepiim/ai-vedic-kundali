export default function TermsOfUse() {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white p-8 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-600">Terms of Use</h1>
                <p className="text-sm text-white/40">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-white/80 leading-relaxed">
                    <p>
                        Welcome to Vedic Astra. By accessing or using our application, you agree to be bound by these Terms of Use.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">1. Acceptance of Terms</h2>
                    <p>
                        By using Vedic Astra, you agree to these terms and our Privacy Policy. If you do not agree, strictly do not use this application.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">2. Use of Service</h2>
                    <p>
                        You agree to use this service only for lawful purposes. You must not use this application to generate content that is harmful, offensive, or violates any laws.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">3. Disclaimer of Warranties</h2>
                    <p>
                        The service is provided "as is" and "as available" without any warranties of any kind. We explicitly disclaim any warranties of fitness for a particular purpose or non-infringement.
                    </p>
                    <p>
                        <strong>Crucially:</strong> You acknowledge that the astrological reports are for entertainment only and do not constitute professional advice.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">4. Intellectual Property</h2>
                    <p>
                        The code, design, and content of Vedic Astra are protected by copyright and other intellectual property laws.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">5. Changes to Terms</h2>
                    <p>
                        We reserve the right to modify these terms at any time. Your continued use of the application constitutes acceptance of those changes.
                    </p>
                </div>
            </div>
        </div>
    );
}
