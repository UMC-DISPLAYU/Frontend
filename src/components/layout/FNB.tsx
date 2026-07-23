import DUfontlogo from '../../assets/DUfontlogo.svg';

export function FNB() {
  return (
    <footer className="relative mx-auto h-60 w-96 max-w-full overflow-hidden bg-zinc-300 mix-blend-multiply">
      <div className="absolute top-6 left-[30px] inline-flex w-80 flex-col items-start justify-start gap-6">
        <div className="flex flex-col items-start justify-start gap-3 self-stretch">
          <img alt="DISPLAYU" className="h-7 w-[57px]" src={DUfontlogo} />
          <p className="text-xs leading-4 font-normal text-slate-950">대학생 전시 플랫폼</p>
        </div>

        <div className="inline-flex items-start justify-start gap-7">
          <p className="shrink-0 text-xs leading-4 font-normal whitespace-pre text-neutral-500">
            {'PM \n고상준'}
          </p>
          <p className="shrink-0 text-xs leading-4 font-normal whitespace-pre text-neutral-500">
            {'DESIGN \n최유성'}
          </p>
          <p className="w-16 shrink-0 text-xs leading-4 font-normal whitespace-pre text-neutral-500">
            {'FrontEnd \n이승철  서현민\n안재인  정아람'}
          </p>
          <p className="shrink-0 text-xs leading-4 font-normal whitespace-pre text-neutral-500">
            {'BackEnd \n김승완  임도현  최건희\n김수빈  김민지  우서윤'}
          </p>
        </div>
      </div>
    </footer>
  );
}
