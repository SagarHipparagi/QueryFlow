import { forwardRef } from 'react';

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-[11px] font-medium text-[var(--text-tertiary)] mb-2 uppercase tracking-wider">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                className={`
          w-full px-4 py-3 text-[14px]
          bg-[var(--bg-card-solid)] text-[var(--text-primary)]
          border border-[var(--border-color)] rounded-xl
          placeholder:text-[var(--text-tertiary)]
          shadow-[var(--shadow-xs)]
          transition-all duration-200 ease-out
          focus:outline-none focus:border-[var(--accent)]/50
          focus:shadow-[0_0_0_3px_var(--accent-soft),0_0_12px_var(--accent)/10]
          ${error ? 'border-[var(--error)] focus:border-[var(--error)] focus:shadow-[0_0_0_3px_var(--error-soft)]' : ''}
          ${className}
        `}
                {...props}
            />
            {error && (
                <p className="mt-1.5 text-[11px] text-[var(--error)]">{error}</p>
            )}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
