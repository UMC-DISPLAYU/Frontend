import DUfontlogo from '../../assets/DUfontlogo.svg';

interface DUMember {
  names: string[];
  role: string;
}

const credits: DUMember[] = [
  { names: ['고상준'], role: 'PM' },
  { names: ['최유성'], role: 'DESIGN' },
  { names: ['안재인', '이승철', '서현민', '정아람'], role: 'FrontEnd' },
  { names: ['임도현', '최건희', '김승완', '김수빈', '김민지', '우서윤'], role: 'BackEnd' },
];

export function FNB() {
  return (
    <footer className="w-full bg-line-soft py-8 px-6 md:py-10 md:px-10 lg:py-12 lg:px-16">
      <div className="mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-8 lg:gap-16 max-w-7xl">
        <div className="flex flex-col items-start gap-2.5 md:gap-3 shrink-0">
          <img alt="DISPLAYU" className="h-6 md:h-7 lg:h-8 w-auto self-start" src={DUfontlogo} />
          <p className="typo-body-xs-regular md:typo-body-sm-regular text-logo">전시공유 플랫폼</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-7 md:gap-8 lg:gap-12">
          {credits.map((item) => (
            <div className="flex shrink-0 flex-col gap-0.5" key={item.role}>
              <p className="typo-body-xs-semibold md:typo-body-sm-semibold text-sub600 whitespace-pre">
                {item.role}
              </p>
              {item.names.map((name, idx) => (
                <p
                  className="typo-body-xs-regular md:typo-body-sm-regular text-hint whitespace-pre"
                  key={idx}
                >
                  {name}
                </p>
              ))}
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
