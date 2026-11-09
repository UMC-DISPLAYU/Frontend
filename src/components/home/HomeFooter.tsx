import { Link } from 'react-router-dom';

import FooterLogo from '@/assets/home/FooterLogo.svg';
import { cn } from '@/utils/cn';

import { HOME_INNER } from './homeLayout';

const FOOTER_LINK_CLASS =
  'relative rounded-4 after:absolute after:inset-x-0 after:-inset-y-3.5 transition-colors duration-fast ease-standard hover:text-primary focus-visible:outline-2 focus-visible:outline-focus';

export function HomeFooter() {
  return (
    <footer className={cn(HOME_INNER, 'grid gap-2 py-5')}>
      <img src={FooterLogo} alt="Display U." width={99} height={23} />
      <div className="typography-body-md-medium flex items-center gap-3 text-tertiary">
        <Link to="/policy" className={FOOTER_LINK_CLASS}>
          이용약관
        </Link>
        <span aria-hidden="true" className="h-2.5 border-l border-primary" />
        <Link to="/policy" className={FOOTER_LINK_CLASS}>
          개인정보처리방침
        </Link>
      </div>
      <small className="typography-body-sm-regular text-tertiary">
        © 2026 displayU. All rights reserved.
      </small>
    </footer>
  );
}
