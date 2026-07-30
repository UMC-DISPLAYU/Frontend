import DUfontlogo from '@/assets/DUfontlogo.svg';
import { cn } from '@/utils/cn';

interface DUMember {
  names: string[];
  role: string;
}

type FNBProps = {
  hasFixedBottomBar?: boolean;
  className?: string;
};

const credits: DUMember[] = [
  { role: 'PM', names: ['고상준'] },
  { role: 'DESIGN', names: ['최유성'] },
  { role: 'FrontEnd', names: ['이승철  서현민', '안재인  정아람'] },
  { role: 'BackEnd', names: ['김승완  임도현  최건희', '김수빈  김민지  우서윤'] },
];

export function FNB({ hasFixedBottomBar = false, className }: FNBProps) {
  return (
    <footer
      className={cn(
        'w-full max-w-md mx-auto bg-line-soft px-[30px] pt-[24px] overflow-hidden',
        hasFixedBottomBar ? 'pb-28' : 'pb-[32px]',
        className,
      )}
    >
      <div className="flex flex-col gap-6">
        {/* 로고 & 서브타이틀 */}
        <div className="flex flex-col items-start gap-3">
          <img alt="DISPLAYU" className="h-6 w-auto self-start" src={DUfontlogo} />
          <p className="typo-body-xs-regular text-main">대학생 전시 플랫폼</p>
        </div>

        {/* 크레딧 목록 */}
        <div className="flex items-start gap-7">
          {credits.map((item) => (
            <div className="flex flex-col gap-0.5 shrink-0" key={item.role}>
              <p className="typo-body-xs-regular text-hint">{item.role}</p>
              {item.names.map((nameLine, idx) => (
                <p className="typo-body-xs-regular text-hint whitespace-pre" key={idx}>
                  {nameLine}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
