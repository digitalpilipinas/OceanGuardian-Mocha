import { useState, useEffect } from "react";
import { Search, Brain } from "lucide-react";

interface Fact {
    id: number;
    content: string;
    category: string;
    source: string;
    tags: string;
}

export default function FactLibrary() {
    const [facts, setFacts] = useState<Fact[]>([]);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchFacts();
    }, [category]); // Re-fetch when category changes

    const fetchFacts = async () => {
        setLoading(true);
        const query = new URLSearchParams();
        if (search) query.append("search", search);
        if (category) query.append("category", category);

        try {
            const res = await fetch(`/api/learning/facts?${query.toString()}`);
            const data = await res.json();
            setFacts(data);
        } catch (err) {
            console.error("Failed to load facts", err);
        } finally {
            setLoading(false);
        }
    };

    const categories = ["Marine Life", "Conservation", "Pollution", "Climate Change", "Coral Reefs"];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="mb-16 text-center">
                <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-4 uppercase">
                    Ocean <span className="text-accent brightness-125 italic">Intelligence</span>
                </h1>
                <p className="text-white/60 text-sm font-black max-w-2xl mx-auto uppercase tracking-[0.3em] italic">
                    Explore the depth of marine intelligence. Use the signal filter to narrow your search.
                </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-6 mb-16 justify-center items-center">
                <div className="relative w-full md:w-[450px]">
                    <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Scan for keywords..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchFacts()}
                        className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/5 rounded-[2rem] text-white font-black uppercase tracking-widest text-[10px] placeholder:text-white/40 focus:bg-white/10 focus:border-primary/50 outline-none transition-all shadow-2xl"
                    />
                </div>
                <div className="flex gap-3 overflow-x-auto pb-4 md:pb-0 hide-scrollbar max-w-full">
                    <button
                        onClick={() => setCategory("")}
                        className={cn(
                            "px-8 py-4 rounded-2xl whitespace-nowrap font-black uppercase tracking-widest text-[10px] transition-all border",
                            category === ""
                                ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                        )}
                    >
                        All Signals
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={cn(
                                "px-8 py-4 rounded-2xl whitespace-nowrap font-black uppercase tracking-widest text-[10px] transition-all border",
                                category === cat
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-white/5 border-white/5 text-white/60 hover:bg-white/10"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Facts Grid */}
            {loading ? (
                <div className="text-center py-20 text-white/40 font-black uppercase tracking-widest italic animate-pulse">Decrypting data...</div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-8 space-y-8">
                    {facts.map((fact) => (
                        <div key={fact.id} className="break-inside-avoid bg-secondary p-10 rounded-[3rem] border border-white/5 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] hover:border-primary/40 transition-all duration-500 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <Brain className="h-16 w-16 text-primary" />
                            </div>
                            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-[10px] font-black uppercase tracking-widest rounded-full mb-6 border border-accent/20">
                                {fact.category}
                            </span>
                            <p className="text-white text-xl font-black italic tracking-tight leading-relaxed mb-8 group-hover:text-primary transition-colors">
                                "{fact.content}"
                            </p>
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/60 border-t border-white/5 pt-6">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-white/40 font-black uppercase tracking-[0.2em] mb-1">Source Protocol</span>
                                    <span className="italic truncate max-w-[200px] text-primary brightness-125" title={fact.source}>
                                        {fact.source || "Satellite Archive"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && facts.length === 0 && (
                <div className="text-center py-20 bg-secondary rounded-[2.5rem] border border-dashed border-white/10 shadow-2xl">
                    <p className="text-white/60 font-black uppercase tracking-widest italic">Signal lost. No data found matching your query.</p>
                </div>
            )}
        </div>
    );
}

function cn(...classes: any[]) {
    return classes.filter(Boolean).join(' ');
}
