import logo from '../../assets/logo.svg';

interface CreditItem {
  name: string;
  role: string;
}

const credits: CreditItem[] = [
  { name: '고상준', role: 'PM' },
  { name: '최유성', role: 'DESIGN' },
  { name: '\u200b', role: 'FrontEnd' },
  { name: '\u200b', role: 'BackEnd' },
];

export function FNB() {
  return (
    <footer className="relative h-[246px] w-full bg-[#d9d9d9]">
      <div className="absolute top-6 left-[30px] flex w-[318px] flex-col gap-[23px]">
        <div className="flex flex-col gap-3">
          <img alt="DISPLAYU" className="h-[28px] w-[57px]" src={logo} />
          <p className="text-[12px] leading-[1.4] font-medium tracking-[-0.3px] text-[#010032]">
            전시공유 플랫폼
          </p>
        </div>

        <div className="flex items-center gap-7 text-[12px] font-medium tracking-[-0.3px] text-[#767676]">
          {credits.map((item) => (
            <div className="shrink-0" key={item.role}>
              <p className="leading-[1.4] whitespace-pre">{item.role}</p>
              <p className="leading-[1.4] whitespace-pre">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
