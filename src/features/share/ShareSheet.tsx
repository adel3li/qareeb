import { useEffect, useState } from 'react';
import { Copy, Download, Share2 } from 'lucide-react';
import { ar } from '../../copy/ar';
import { useDua } from '../../content/load';
import { useOverlays } from '../../app/overlays';
import { Dialog } from '../../components/Dialog';
import { Button } from '../../components/Button';
import { Icon } from '../../components/Icon';
import { SegmentedControl } from '../../components/SegmentedControl';
import { useToast } from '../../components/Toast';
import { copyText, duaUrl } from '../../lib/clipboard';
import { downloadBlob } from '../../lib/download';
import { shareText } from '../../lib/reference';
import { canvasToBlob, drawShareCard, type ShareFormat, type ShareLevel } from './drawShareCard';

/** Share a dua: an image (post 4:5 or story 9:16) at three levels, or its text. Never anything the user wrote. */
export default function ShareSheet({ duaId }: { duaId: string }) {
  const dua = useDua(duaId);
  const close = useOverlays((s) => s.closeShare);
  const toast = useToast((s) => s.show);
  const [format, setFormat] = useState<ShareFormat>('post');
  const [level, setLevel] = useState<ShareLevel>('dua');
  const [image, setImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!dua) return;
    let cancelled = false;
    let url = '';
    setImage(null);
    setFailed(false);
    drawShareCard(dua, format, level)
      .then(canvasToBlob)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setImage({ url, blob });
      })
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [dua, format, level]);

  if (!dua) return null;
  const fileName = `qareeb-${dua.id}-${format}.png`;
  const file = image ? new File([image.blob], fileName, { type: 'image/png' }) : null;
  const canShareFile = !!file && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] });

  return (
    <Dialog open title={ar.share.title} onClose={close}>
      <SegmentedControl
        role="radio"
        label={ar.share.format}
        value={format}
        onChange={setFormat}
        options={[
          { value: 'post', label: ar.share.post },
          { value: 'story', label: ar.share.story },
        ]}
      />
      <SegmentedControl
        role="radio"
        label={ar.share.level}
        value={level}
        onChange={setLevel}
        options={[
          { value: 'dua', label: ar.share.levels.dua },
          { value: 'scene', label: ar.share.levels.scene },
          { value: 'reflection', label: ar.share.levels.reflection },
        ]}
      />
      <div className="flex min-h-[200px] items-center justify-center rounded-card bg-surface-sunken p-5">
        {image ? (
          <img src={image.url} alt={ar.share.preview} className={`block h-auto rounded-sm shadow-card ${format === 'story' ? 'w-[52%]' : 'w-[78%]'}`} />
        ) : (
          <p role="status" className="m-0 text-t-body-sm text-text-muted">
            {failed ? ar.share.failed : ar.share.drawing}
          </p>
        )}
      </div>
      <p className="m-0 text-t-body-sm text-text-body">{ar.share.privacy}</p>
      <Button
        variant="secondary"
        block
        icon={<Icon icon={Copy} />}
        onClick={async () => toast((await copyText(shareText(dua, duaUrl(dua.id)))) ? ar.common.copied : ar.common.copyFailed)}
      >
        {ar.share.copyText}
      </Button>
      {canShareFile ? (
        <Button variant="primary" block icon={<Icon icon={Share2} />} onClick={() => file && navigator.share({ files: [file], title: dua.title }).catch(() => undefined)}>
          {ar.share.shareImage}
        </Button>
      ) : (
        <Button variant="primary" block waiting={!image} icon={<Icon icon={Download} />} onClick={() => image && downloadBlob(image.blob, fileName)}>
          {ar.share.download}
        </Button>
      )}
    </Dialog>
  );
}
