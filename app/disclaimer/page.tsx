export default function Disclaimer() {
    return (
        <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a0a] to-black text-white p-8 md:p-12 font-sans">
            <div className="max-w-3xl mx-auto space-y-8">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">Disclaimer</h1>

                <div className="space-y-6 text-white/80 leading-relaxed">
                    <p>
                        <strong>For Entertainment Purposes Only.</strong> The information, reports, and insights provided by Vedic Astra are for entertainment purposes only. While we utilize advanced AI and traditional calculation methods, astrology is not a proven science and should not be used as a substitute for professional advice.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">Not Professional Advice</h2>
                    <p>
                        The content provided by this application does not constitute medical, legal, financial, or psychological advice. You should not rely on this information to make significant life decisions.
                    </p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Medical:</strong> If you have a medical condition, consult a qualified healthcare professional.</li>
                        <li><strong>Financial:</strong> For financial decisions, consult a certified financial advisor.</li>
                        <li><strong>Legal:</strong> For legal matters, consult a licensed attorney.</li>
                    </ul>

                    <h2 className="text-2xl font-semibold text-white mt-8">No Guarantee of Accuracy</h2>
                    <p>
                        Vedic Astra uses Artificial Intelligence to generate interpretations. AI can make mistakes, hallucinate facts, or provide inaccurate analyses. We make no rigorous claims regarding the accuracy, reliability, or completeness of the information provided.
                    </p>

                    <h2 className="text-2xl font-semibold text-white mt-8">Limitation of Liability</h2>
                    <p>
                        By using this service, you agree that Vedic Astra and its creators shall not be held liable for any direct, indirect, incidental, or consequential damages resulting from your use of (or inability to use) this service or your reliance on any information provided herein.
                    </p>
                </div>
            </div>
        </div>
    );
}
