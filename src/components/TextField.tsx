import { Lock, Search } from 'lucide-react';
import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';
import { ar } from '../copy/ar';
import { Icon } from './Icon';

const fieldBase =
  'box-border w-full rounded-(--radius-control) border border-hairline bg-surface-sunken text-t-body leading-[1.8] text-text placeholder:text-text-muted';

/** A short field with a visible label above it. */
export function TextField({ label, className = '', ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      <label htmlFor={id} className="text-t-label text-text">
        {label}
      </label>
      <input id={id} className={`${fieldBase} min-h-12 px-[14px]`} {...rest} />
    </div>
  );
}

/** A multi-line field. `prominent` sets the label in `subtitle` (the journal prompt). */
export function TextArea({
  label,
  prominent,
  privacyNote,
  className = '',
  ...rest
}: { label: string; prominent?: boolean; privacyNote?: boolean } & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className={`flex flex-col gap-[6px] ${className}`}>
      <label htmlFor={id} className={prominent ? 'font-q-heading text-t-subtitle text-text' : 'text-t-label text-text'}>
        {label}
      </label>
      <textarea id={id} className={`${fieldBase} min-h-[150px] resize-none px-4 py-[14px]`} {...rest} />
      {privacyNote && <PrivacyHint />}
    </div>
  );
}

export function PrivacyHint() {
  return (
    <p className="m-0 flex items-center gap-2 text-t-caption font-normal text-text-muted">
      <Icon icon={Lock} size={16} />
      {ar.promises.privacy}
    </p>
  );
}

/** Search with the icon inside the field at the start. */
export function SearchField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="flex min-h-12 items-center gap-[10px] rounded-(--radius-control) bg-surface-sunken px-[14px] text-text-muted">
      <Icon icon={Search} />
      <input
        type="search"
        aria-label={label}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-12 min-w-0 flex-1 border-0 bg-transparent text-t-body text-text outline-offset-4 placeholder:text-text-muted"
      />
    </div>
  );
}
