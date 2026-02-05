export default function GlassCard({ children, className = '', hover = true }) {
    return (
        <div
            className={`
        glass rounded-2xl p-6
        transition-all duration-200 ease-out
        animate-fadeInUp
        ${hover ? 'hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5' : ''}
        ${className}
      `}
        >
            {children}
        </div>
    );
}
