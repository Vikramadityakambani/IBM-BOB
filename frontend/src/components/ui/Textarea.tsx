import React from 'react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({
  label,
  error,
  helperText,
  className = '',
  id,
  rows = 4,
  ...props
}, ref) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="block text-xs font-medium text-slate-300 mb-1.5 select-none">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={`
          block w-full rounded-lg bg-slate-900 border text-slate-100 placeholder-slate-500
          text-sm px-3.5 py-2.5 transition-colors font-sans
          focus:outline-none focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500
          disabled:bg-slate-950 disabled:text-slate-500 disabled:cursor-not-allowed
          ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/30' : 'border-slate-700/80 hover:border-slate-600'}
          ${className}
        `}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs text-rose-400 font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-slate-500">{helperText}</p>}
    </div>
  );
});

Textarea.displayName = 'Textarea';
