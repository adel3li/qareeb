import { useEffect, useState } from 'react';
import { Copy, Download, Share2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Dialog } from '../../components/Dialog';
import { Icon } from '../../components/Icon';
import { SegmentedControl } from '../../components/SegmentedControl';
import { toast } from '../../components/Toast';
import { findDua, useContent } from '../../content/load';
import { ar } from '../../copy/ar';
import { saveBlob } from '../backup/download';
import { copyToClipboard } from '../dua/DuaCard';
import { useUi } from '../../state/ui';
import { canvasToBlob, drawShareCard } from './drawCard';
import type { Format, Level } from './layout';
import { shareText } from './shareText';

/** Share a dua as an image (4:5 or 9:16, drawn on a canvas) or as text. Never anything the user wrote. */
export default function ShareDialog() {
  const duaId = useUi((s) => s.share?.duaId);
  const close = useUi((s) => s.closeShare);
  const dua = findDua(useContent(), duaId);
  const [format, setFormat] = useState<Format>('post');
  const [level, setLevel] = useState<Level>('dua');
  const [image, setImage] = useState<{ url: string; blob: Blob } | null>(null);

  useEffect(() => {
    if (!dua) return;
    let cancelled = false;
    let url = '';
    setImage(null);
    drawShareCard(dua, format, level)
      .then(canvasToBlob)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ url, blob });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [dua, format, level]);

  if (!dua) return null;
  const fileName = `qareeb-${dua.id}-${format}.png`;
  const file = image ? new File([image.blob], fileName, { type: 'image/png' }) : null;
  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  const shareImage = async () => {
    if (!image || !file) return;
    if (canShareFile) {
      try {
        await navigator.share({ files: [file], title: dua.title });
      } catch {
        /* the user closed the share sheet */
      }
    } else {
      saveBlob(image.blob, fileName);
    }
  };

  const levels: { value: Level; label: string }[] = [
    { value: 'dua', label: ar.share.levelDua },
    { value: 'scene', label: ar.share.levelScene },
    ...(dua.reflections.length ? [{ value: 'reflection' as const, label: ar.share.levelReflection }] : []),
  ];

  return (
    <Dialog
      title={ar.share.title}
      onClose={close}
      actions={
        <>
          <Button variant="secondary" block icon={<Icon as={Copy} />} onClick={async () => (await copyToClipboard(shareText(dua))) && toast(ar.share.copied)}>
            {ar.share.copyText}
          </Button>
          <Button block waitingFor={!image} icon={<Icon as={canShareFile ? Share2 : Download} />} onClick={shareImage}>
            {canShareFile ? ar.share.shareImage : ar.share.download}
          </Button>
        </>
      }
    >
      <SegmentedControl role="radio" label={ar.share.formatLabel} value={format} onChange={setFormat} options={[{ value: 'post', label: ar.share.post }, { value: 'story', label: ar.share.story }]} />
      <SegmentedControl role="radio" label={ar.share.levelLabel} value={level} onChange={setLevel} options={levels} />
      <div className="flex h-[min(42dvh,320px)] items-center justify-center rounded-card bg-sunken p-3">
        {image ? (
          <img src={image.url} alt={ar.share.preview(dua.title)} className="block max-h-full max-w-full rounded-sm object-contain shadow-card" />
        ) : (
          <p role="status" className="m-0 text-t-body-sm text-muted">
            {ar.share.drawing}
          </p>
        )}
      </div>
      <p className="m-0 text-t-body-sm text-body">{ar.share.note}</p>
    </Dialog>
  );
}
