import s from './brand.module.css';
import { BrandExhibitionIndex } from './BrandExhibitionIndex';
import { BrandFooter } from './BrandFooter';
import { BrandHero } from './BrandHero';
import { useBrandPageChrome } from './useBrandPageChrome';

/** 브랜드 홍보 페이지 본문(프로토타입 brand.html, 웹 전용): 포스터 벽 → 전시 목록 → 맺음 */
export function BrandLanding() {
  useBrandPageChrome();

  return (
    <div className={s.page}>
      <main>
        <BrandHero />
        <BrandExhibitionIndex />
      </main>
      <BrandFooter />
    </div>
  );
}
