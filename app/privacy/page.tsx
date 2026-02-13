export default function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white p-8 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-600">Privacy Policy</h1>
                <p className="text-sm text-white/40">Last Updated: {new Date().toLocaleDateString()}</p>

                <div className="space-y-6 text-white/80 leading-relaxed">
                    <p>
                        At Vedic Astra, we prioritize your privacy. This policy explains how we handle your personal information.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">Information We Collect</h2>
                    <p>
                        To generate your horoscope, we require the following birth details:
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Date of Birth</li>
                        <li>Time of Birth</li>
                        <li>Place of Birth (Latitude & Longitude)</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-white mt-8">How We Use Your Data</h2>
                    <p>
                        <strong>Transient Processing:</strong> Your birth details are used <em>solely</em> for the purpose of calculating your astrological chart and generating the AI report.
                    </p>
                    <p>
                        <strong>Third-Party Processing:</strong> To provide the interpretation, your chart data (planetary positions, not your PII like name) is sent to OpenAI's API. OpenAI extracts the astrological insights which are then returned to you.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">Data Storage</h2>
                    <p>
                        We do <strong>not</strong> permanently store your personal birth data on our servers. The data is processed in real-time and discarded after the session or report generation is complete.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">Cookies</h2>
                    <p>
                        We use minimal local storage or cookies solely to maintain your session state (e.g., preserving your chart view upon refresh). We do not use cookies for tracking or advertising.
                    </p>
                </div>
            </div>
        </div>
    );
}
