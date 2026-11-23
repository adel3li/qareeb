import { Copy, Download, Share2 } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { SegmentedControl } from '../../components/SegmentedControl';
import { ar } from '../../copy/ar';
import { findDua, useContent } from '../../content/load';
import type { Dua } from '../../content/types';
import type { ShareFormat, ShareLevel } from '../../lib/shareLayout';
import { useUi } from '../../state/ui';
import { copyDua } from '../dua-actions';
import { canvasToBlob, drawShareCard } from './drawShareCard';

/** The share sheet: choose size and content, see the image, share or save it, or copy the text. */
export default function ShareSheet() {
  const id = useUi((s) => s.shareDuaId);
  const content = useContent();
  const dua = id && content ? findDua(content, id) : undefined;
  if (!dua) return null;
  return <ShareSheetFor dua={dua} />;
}

const FORMATS = (['post', 'story'] as const).map((value) => ({ value, label: ar.share.formats[value] }));

function ShareSheetFor({ dua }: { dua: Dua }) {
  const close = useUi((s) => s.closeShare);
  const announce = useUi((s) => s.announce);
  const [format, setFormat] = useState<ShareFormat>('post');
  const [level, setLevel] = useState<ShareLevel>('dua');
  const [image, setImage] = useState<{ blob: Blob; url: string } | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const levels = (['dua', 'scene', 'reflection'] as const)
    .filter((v) => v !== 'reflection' || dua.reflections.length > 0)
    .map((value) => ({ value, label: ar.share.levels[value] }));

  useEffect(() => {
    let cancelled = false;
    let url: string | null = null;
    setImage(null);
    const canvas = (canvasRef.current ??= document.createElement('canvas'));
    drawShareCard(canvas, { dua, format, level })
      .then(() => canvasToBlob(canvas))
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ blob, url });
      })
      .catch(() => {
        if (!cancelled) announce(ar.share.failed);
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [dua, format, level, announce]);

  const fileName = `qareeb-${dua.id}-${format}.png`;
  const file = image ? new File([image.blob], fileName, { type: 'image/png' }) : null;
  const canShareFile = Boolean(file && navigator.canShare?.({ files: [file] }));

  const download = () => {
    if (!image) return;
    const a = document.createElement('a');
    a.href = image.url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const share = async () => {
    if (!file) return;
    if (!canShareFile) return download();
    try {
      await navigator.share({ files: [file] });
    } catch (e) {
      if ((e as DOMException)?.name !== 'AbortError') announce(ar.share.failed);
    }
  };

  return (
    <Dialog open onClose={close} title={ar.share.title}>
      <SegmentedControl role="radio" label={ar.share.format} options={FORMATS} value={format} onChange={setFormat} />
      <SegmentedControl role="radio" label={ar.share.level} options={levels} value={level} onChange={setLevel} />
      <div className="flex min-h-[200px] shrink-0 items-center justify-center rounded-(--radius-control) bg-surface-sunken p-3">
        {image ? (
          <img src={image.url} alt={ar.share.imageAlt} className="block h-auto max-h-[46dvh] w-auto max-w-full object-contain shadow-(--card-shadow)" />
        ) : (
          <p role="status" className="m-0 text-t-body-sm text-text-muted">
            {ar.share.preparing}
          </p>
        )}
      </div>
      <p className="m-0 text-t-caption font-normal text-text-muted">{ar.share.note}</p>
      <div className="flex flex-col gap-[10px]">
        <Button variant="secondary" block icon={Copy} onClick={() => void copyDua(dua)}>
          {ar.share.copyText}
        </Button>
        <Button variant="primary" block icon={canShareFile ? Share2 : Download} waiting={!image} onClick={() => void share()}>
          {canShareFile ? ar.share.shareImage : ar.share.saveImage}
        </Button>
      </div>
    </Dialog>
  );
}
