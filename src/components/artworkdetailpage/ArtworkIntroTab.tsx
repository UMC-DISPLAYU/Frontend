import { ProcessStrip } from './ProcessStrip';

type Props = {
  content?: string | null;
  point?: string | null;
  processImageUrls: string[];
};

export function ArtworkIntroTab({ content, point, processImageUrls }: Props) {
  return (
    <div>
      <div className="px-gutter pt-7 desktop:px-0">
        {content?.trim() && (
          <p className="typography-body-lg-regular desktop:typography-body-xl-regular break-words whitespace-pre-line text-primary">
            {content}
          </p>
        )}

        {point?.trim() && (
          <p className="typography-body-lg-regular desktop:typography-body-xl-regular mt-5 rounded-12 bg-secondary p-4 break-words whitespace-pre-line text-secondary first:mt-0">
            {point}
          </p>
        )}
      </div>

      {processImageUrls.length > 0 && <ProcessStrip imageUrls={processImageUrls} />}

      <div className="h-6" />
    </div>
  );
}
