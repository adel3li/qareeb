import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { Lock, Search, X } from 'lucide-react';
import { Icon } from './Icon';
import { ar } from '../copy/ar';

const field = 'box-border w-full rounded-control border border-solid border-hairline bg-sunken text-t-body text-ink placeholder:text-muted';

export function Field({ label, children, labelClass = '' }: { label: ReactNode; children: (id: string) => ReactNode; labelClass?: string }) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className={labelClass || 'text-t-label text-ink'}>
        {label}
      </label>
      {children(id)}
    </div>
  );
}

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function TextInput({ className = '', ...rest }, ref) {
  return <input ref={ref} {...rest} className={`${field} min-h-12 px-3.5 ${className}`} />;
});

export const TextArea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function TextArea({ className = '', ...rest }, ref) {
  return <textarea ref={ref} {...rest} className={`${field} min-h-[150px] resize-none px-4 py-3.5 leading-[1.8] ${className}`} />;
});

export function PrivacyLine() {
  return (
    <p className="m-0 flex items-center gap-2 text-t-caption font-normal text-muted">
      <Icon as={Lock} size={16} />
      {ar.privacyLine}
    </p>
  );
}

export function SearchField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex min-h-12 items-center gap-2.5 rounded-control bg-sunken px-3.5 text-muted">
      <Icon as={Search} />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={ar.library.search}
        aria-label={ar.library.searchLabel}
        className="min-w-0 flex-1 border-0 bg-transparent py-2 text-t-body text-ink placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label={ar.library.clear} className="-me-2 inline-flex size-touch items-center justify-center rounded-pill border-0 bg-transparent text-muted">
          <Icon as={X} size={18} />
        </button>
      )}
    </div>
  );
}
