import { useState } from 'react';
import { Send, Sparkles, HelpCircle } from 'lucide-react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const suggestedQueries = [
    { text: 'How many t-shirts are in stock?', category: 'inventory' },
    { text: 'Show Nike products under $30', category: 'products' },
    { text: 'What colors are available for Adidas?', category: 'products' },
    { text: 'Low stock items below 50 units', category: 'alerts' },
    { text: 'Best selling brand', category: 'analytics' },
];

export default function QuerySection({ onSubmit, isLoading = false }) {
    const [query, setQuery] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(true);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!query.trim() || isLoading) return;
        setShowSuggestions(false);
        await onSubmit?.(query);
    };

    const handleSuggestionClick = (suggestion) => {
        setQuery(suggestion);
        setShowSuggestions(false);
    };

    const isAmbiguous = query.length > 0 && query.length < 10 && !query.includes('?');

    return (
        <div className="glass rounded-2xl p-6 space-y-4">
            {/* Header */}
            <div>
                <h3 className="text-[14px] font-medium text-[var(--text-primary)]">
                    Query Database
                </h3>
                <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">
                    Ask questions in natural language
                </p>
            </div>

            {/* Query Input */}
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-3">
                    <div className="flex-1">
                        <Input
                            value={query}
                            onChange={(e) => {
                                setQuery(e.target.value);
                                if (e.target.value === '') setShowSuggestions(true);
                            }}
                            placeholder="How many Nike t-shirts are in stock?"
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        size="md"
                        className="min-w-[100px]"
                    >
                        {isLoading ? (
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <Send size={14} />
                        )}
                        <span>{isLoading ? 'Running' : 'Run'}</span>
                    </Button>
                </div>

                {/* Ambiguity Warning */}
                {isAmbiguous && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-[var(--warning)]/[0.08] border border-[var(--warning)]/10">
                        <HelpCircle size={14} className="text-[var(--warning)] mt-0.5 flex-shrink-0" />
                        <p className="text-[11px] text-[var(--warning)]">
                            Your query seems brief. Try being more specific for better results.
                        </p>
                    </div>
                )}
            </form>

            {/* Suggestions */}
            {showSuggestions && !isLoading && (
                <div className="space-y-2.5">
                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-quaternary)] font-medium">
                        Try these examples
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {suggestedQueries.map((s, i) => (
                            <button
                                key={i}
                                onClick={() => handleSuggestionClick(s.text)}
                                className="px-3 py-1.5 text-[11px] text-[var(--text-secondary)]
                           bg-[var(--bg-card-solid)] border border-[var(--border-color)]
                           rounded-lg hover:border-[var(--accent)]/30 hover:text-[var(--accent)]
                           transition-all duration-200"
                            >
                                {s.text}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
