import { CommunitySection, MyActivitySection, QnaSection } from '@/components/lounge';

export const LoungePage = () => {
  return (
    <div className="w-full max-w-105 mx-auto bg-gray-100 min-h-dvh overflow-x-hidden px-5 pt-3.5 pb-[53px]">
      <div className="flex flex-col gap-[41px]">
        <div className="flex flex-col gap-1">
          <h1 className="typo-heading-3xl text-slate-900">Lounge</h1>
          <p className="typo-body-xs-regular text-neutral-500">자유롭게 대화를 나눠보세요.</p>
        </div>
        <CommunitySection />
      </div>

      <div className="mt-5">
        <QnaSection />
      </div>

      <div className="mt-5">
        <MyActivitySection />
      </div>
    </div>
  );
};
