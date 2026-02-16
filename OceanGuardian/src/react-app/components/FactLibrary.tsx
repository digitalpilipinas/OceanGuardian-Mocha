import { useState, useEffect } from "react";
import { Search, Tag } from "lucide-react";

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-10 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Ocean Fact Library</h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Discover fascinating truths about our oceans. Use the search to find specific topics or browse by category.
                </p>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                        type="text"
                        placeholder="Search facts..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && fetchFacts()}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
                    <button
                        onClick={() => setCategory("")}
                        className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${category === "" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                    >
                        All
                    </button>
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${category === cat ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Facts Grid */}
            {loading ? (
                <div className="text-center py-12">Loading facts...</div>
            ) : (
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
                    {facts.map((fact) => (
                        <div key={fact.id} className="break-inside-avoid bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <span className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full mb-3">
                                {fact.category}
                            </span>
                            <p className="text-gray-800 text-lg font-medium leading-relaxed mb-4">
                                {fact.content}
                            </p>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                                <div className="flex items-center space-x-2">
                                    <Tag className="h-4 w-4" />
                                    <span>{fact.tags?.split(",")[0] || "General"}</span>
                                </div>
                                {fact.source && (
                                    <span className="text-xs italic truncate max-w-[150px]" title={fact.source}>
                                        Src: {fact.source}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && facts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No facts found matching your criteria. Try a different search!
                </div>
            )}
        </div>
    );
}
