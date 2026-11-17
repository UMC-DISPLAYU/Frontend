import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

import { PageContainer } from '@/components/layout';
import type { PolicyDocKey } from '@/components/policy';
import { POLICY_DOCUMENTS, PolicyBackIcon, PolicyDocumentView } from '@/components/policy';

const isPolicyDocKey = (value: string | null): value is PolicyDocKey =>
  value !== null && Object.prototype.hasOwnProperty.call(POLICY_DOCUMENTS, value);

export function PolicyPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const doc = searchParams.get('doc');
  const policy = POLICY_DOCUMENTS[isPolicyDocKey(doc) ? doc : 'service'];

  /* 링크로 바로 들어왔으면 돌아갈 화면이 없으니 홈으로 보낸다(프로토타입) */
  const goBack = () => {
    if (location.key === 'default') navigate('/home', { replace: true });
    else navigate(-1);
  };

  return (
    <div className="bg-primary-white">
      <PageContainer variant="form" className="max-w-120 bg-primary-white">
        <header className="-ml-2.5 flex h-14 shrink-0 items-center gap-0.5">
          <button
            type="button"
            onClick={goBack}
            aria-label="뒤로"
            className="grid size-11 cursor-pointer place-items-center rounded-circle text-primary transition-colors duration-fast hover:bg-secondary focus-visible:outline-2 focus-visible:outline-focus"
          >
            <PolicyBackIcon className="size-6" />
          </button>
          <h1 className="typography-title-xs text-primary">{policy.title}</h1>
        </header>

        <main>
          <PolicyDocumentView blocks={policy.blocks} />
        </main>
      </PageContainer>
    </div>
  );
}
