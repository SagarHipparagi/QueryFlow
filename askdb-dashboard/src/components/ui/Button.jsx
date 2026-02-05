const variants = {
    primary: `bg-gradient-to-b from-[#0077ed] to-[#0066d6]
            text-white 
            shadow-[0_1px_2px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.12)]
            hover:shadow-[0_6px_16px_rgba(0,102,214,0.35)] 
            hover:-translate-y-0.5
            active:translate-y-0 active:shadow-[0_1px_2px_rgba(0,0,0,0.15)]`,
    secondary: `bg-[var(--bg-card-solid)] text-[var(--text-primary)] 
              border border-[var(--border-color)]
              shadow-[var(--shadow-xs)]
              hover:bg-[var(--bg-elevated)] hover:-translate-y-0.5
              hover:shadow-[var(--shadow-sm)]`,
    ghost: `bg-transparent text-[var(--text-secondary)] 
          hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]/50`,
};

const sizes = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-4 py-2.5 text-[12px]',
    lg: 'px-5 py-3 text-[13px]',
};

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    ...props
}) {
    return (
        <button
            className={`
        inline-flex items-center justify-center gap-1.5 font-medium
        rounded-xl transition-all duration-200 ease-out
        active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
            {...props}
        >
            {children}
        </button>
    );
}
