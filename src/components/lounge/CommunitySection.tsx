import { ArrowUpRight } from 'lucide-react';

import { LoungeCard } from './LoungeCard';

const TIP_CARDS = ['전시 준비·작업 팁', '모집·협업'];

export function CommunitySection() {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-start gap-2.5">
        <LoungeCard className="flex-1 h-72 flex flex-col justify-between items-end">
          <div className="w-full flex flex-col items-end gap-8">
            <ArrowUpRight className="size-5 text-neutral-400" strokeWidth={1.5} />
            <img alt="" className="w-full h-36 object-cover" src="https://placehold.co/150x150" />
          </div>
          <div className="w-full flex flex-col items-start gap-1">
            <h3 className="typo-body-3xl-semibold text-neutral-900">전시후기</h3>
            <p className="typo-body-xs-regular text-neutral-600">
              전시를 체험한
              <br />
              이야기와 감상을 나눠요
            </p>
          </div>
        </LoungeCard>

        <div className="flex-1 flex flex-col gap-2.5">
          {TIP_CARDS.map((title) => (
            <LoungeCard key={title} className="h-36 flex flex-col justify-between items-end">
              <ArrowUpRight className="size-5 text-neutral-400" strokeWidth={1.5} />
              <div className="w-full flex flex-col items-start gap-1">
                <h3 className="typo-body-3xl-semibold text-neutral-900">{title}</h3>
                <p className="typo-body-xs-regular text-neutral-600">
                  전시 준비 과정과
                  <br />
                  작업 노하우를 공유해요
                </p>
              </div>
            </LoungeCard>
          ))}
        </div>
      </div>

      <LoungeCard className="flex items-start justify-between">
        <div className="flex items-end gap-4">
          <div className="flex flex-col justify-end gap-1">
            <h3 className="typo-body-3xl-semibold text-neutral-900">전시 장소 대여</h3>
            <p className="typo-body-xs-regular text-neutral-600">
              전시 장소에 대한 정보를 공유해요
            </p>
          </div>
          <img
            alt=""
            className="w-24 h-20 object-cover shrink-0"
            src="https://placehold.co/97x76"
          />
        </div>
        <ArrowUpRight className="size-5 text-neutral-400 shrink-0" strokeWidth={1.5} />
      </LoungeCard>
    </div>
  );
}
