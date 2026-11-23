import { Pencil, Trash2 } from 'lucide-react';
import { ar } from '../copy/ar';
import { IconButton } from './IconButton';

/** One thing the user wrote in «ما وجدته». Edit and delete are always visible. */
export function JournalEntry({ duaTitle, text, intention, onEdit, onDelete }: { duaTitle?: string; text: string; intention?: string; onEdit: () => void; onDelete: () => void }) {
  return (
    <article className="flex flex-col gap-[6px] rounded-(--radius-card) border border-hairline bg-surface px-(--card-padding) pt-3 pb-[6px]">
      {duaTitle && <p className="m-0 text-t-caption font-semibold text-accent">{duaTitle}</p>}
      <p className="m-0 text-t-body leading-[1.85] whitespace-pre-wrap text-text">{text}</p>
      <div className="flex items-center justify-between text-t-caption font-normal text-text-muted">
        <span>{intention}</span>
        <span className="-me-[10px] flex">
          <IconButton icon={Pencil} label={ar.notebook.editEntry} onClick={onEdit} />
          <IconButton icon={Trash2} label={ar.notebook.deleteEntry} onClick={onDelete} />
        </span>
      </div>
    </article>
  );
}
