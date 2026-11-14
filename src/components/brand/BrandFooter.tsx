import { Link } from 'react-router-dom';

import s from './brand.module.css';
import { BrandArrowIcon } from './BrandArrowIcon';
import { BrandWordmark } from './BrandWordmark';

/** 맺음: 검은 바탕에 큰 한 줄 링크 */
export function BrandFooter() {
  return (
    <footer className={s.end}>
      <Link className={s.big} to="/home">
        전시 둘러보기
        <BrandArrowIcon />
      </Link>
      <div className={s.foot}>
        <span>
          <BrandWordmark className={s.wm} />
        </span>
        <span>대학생 전시 · 작품 아카이브</span>
      </div>
    </footer>
  );
}
