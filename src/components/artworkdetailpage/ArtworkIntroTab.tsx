import { ProcessStrip } from './ProcessStrip';

type Props = {
  content?: string | null;
  processImageUrls: string[];
};

export function ArtworkIntroTab({ content, processImageUrls }: Props) {
  return (
    <div className="px-gutter pt-7 pb-6 desktop:px-0">
      {content?.trim() && (
        <p className="typography-body-lg-regular desktop:typography-body-xl-regular break-words whitespace-pre-line text-primary">
          {content}
        </p>
      )}

      {processImageUrls.length > 0 && <ProcessStrip imageUrls={processImageUrls} />}
    </div>
  );
}
