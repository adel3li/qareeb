import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { Lock, Search } from 'lucide-react';
import { Icon } from './Icon';
import { ar } from '../copy/ar';

const field = 'box-border w-full rounded-control border border-solid border-hairline bg-surface-sunken font-sans text-t-body text-text placeholder:text-text-muted';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

/** A short field with a visible label. */
export function TextField({ label, className = '', ...rest }: FieldProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-t-label font-medium text-text">
        {label}
      </label>
      <input id={id} {...rest} className={`${field} min-h-12 px-3.5 ${className}`} />
    </div>
  );
}

interface AreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  /** The journal prompt is the label, set as a subtitle above the area. */
  labelStyle?: 'field' | 'prompt' | 'hidden';
  privacyLine?: boolean;
}

/** The journal area: at least 150px, never resized by a handle, with the privacy line under it. */
export function TextArea({ label, labelStyle = 'field', privacyLine, className = '', ...rest }: AreaProps) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className={
          labelStyle === 'prompt'
            ? 'font-kufi text-t-subtitle text-text'
            : labelStyle === 'hidden'
              ? 'sr-only'
              : 'text-t-label font-medium text-text'
        }
      >
        {label}
      </label>
      <textarea id={id} {...rest} className={`${field} min-h-[150px] resize-none px-4 py-3.5 leading-[1.8] ${className}`} />
      {privacyLine ? <PrivacyLine /> : null}
    </div>
  );
}

export function PrivacyLine() {
  return (
    <p className="m-0 flex items-center gap-2 text-t-caption text-text-muted">
      <Icon icon={Lock} size="sm" />
      {ar.common.privacyLine}
    </p>
  );
}

/** Search: matching normalises Arabic in both directions (normalizeArabic). */
export function SearchField({ value, onChange, placeholder, label }: { value: string; onChange: (v: string) => void; placeholder: string; label: string }) {
  return (
    <div className="flex min-h-12 items-center gap-2.5 rounded-control bg-surface-sunken px-3.5 text-text-muted">
      <Icon icon={Search} />
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-w-0 flex-1 border-0 bg-transparent font-sans text-t-body text-text outline-offset-4 placeholder:text-text-muted"
      />
    </div>
  );
}
