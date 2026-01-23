'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { KundaliResult } from '@/lib/astrology/types';

interface ChatInterfaceProps {
    chartData: KundaliResult;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export default function ChatInterface({ chartData }: ChatInterfaceProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hari Om! I have analyzed your charts. Feel free to ask about your career, relationships, or current Dasha periods.' }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chartData: {
                        // Send relevant summary to save tokens
                        birthDetails: chartData.birthDetails,
                        planets: chartData.planets,
                        dasha: chartData.dasha,
                        houses: chartData.houses, // might be large, maybe strip planets lists
                        ascendant: chartData.ascendant
                    },
                    messages: [...messages, userMsg]
                })
            });

            if (!res.ok) throw new Error('Failed');

            const data = await res.json();
            setMessages(prev => [...prev, { role: 'assistant', content: data.content }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Connection to the cosmos interrupted. Please try again.' }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed bottom-6 right-6 p-4 bg-primary text-white rounded-full shadow-2xl hover:scale-110 transition-transform z-50 ${isOpen ? 'hidden' : 'flex'} items-center gap-2`}
            >
                <MessageCircle className="h-6 w-6" />
                <span className="font-bold hidden md:inline">Ask Astrologer</span>
            </button>

            {/* Chat Window */}
            <div
                className={`fixed bottom-6 right-6 w-full md:w-[400px] h-[500px] glass-card flex flex-col z-50 transition-all duration-300 transform origin-bottom-right ${isOpen ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-90 opacity-0 pointer-events-none'
                    }`}
            >
                <header className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5 rounded-t-xl">
                    <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-yellow-300" />
                        <h3 className="font-bold text-white">Vedic AI Assistant</h3>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1 rounded">
                        <X className="h-5 w-5 text-white/60" />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
                    {messages.map((m, i) => (
                        <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div
                                className={`max-w-[85%] p-3 rounded-lg text-sm ${m.role === 'user'
                                        ? 'bg-primary text-white rounded-tr-none'
                                        : 'bg-white/10 text-white/90 rounded-tl-none border border-white/5'
                                    }`}
                            >
                                {m.content}
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div className="flex justify-start">
                            <div className="bg-white/10 p-3 rounded-lg rounded-tl-none flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin text-white/50" />
                                <span className="text-xs text-white/50">Consulting stars...</span>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-3 border-t border-white/10 bg-black/20 rounded-b-xl">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="Ask about your chart..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        />
                        <button
                            onClick={handleSend}
                            disabled={loading || !input.trim()}
                            className="p-2 bg-primary rounded-lg hover:bg-primary/80 disabled:opacity-50"
                        >
                            <Send className="h-4 w-4 text-white" />
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
