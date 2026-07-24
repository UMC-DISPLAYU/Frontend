export function Poster({
  src,
  w = 96,
  h = 128,
  radius = 12,
}: {
  src: string | null;
  w?: number;
  h?: number;
  radius?: number;
}) {
  if (src) {
    return (
      <img
        src={src}
        alt="poster"
        className="shrink-0 object-cover shadow-[2px_4px_18px_rgba(6,3,45,0.06)]"
        style={{ width: w, height: h, borderRadius: radius }}
      />
    );
  }
  return (
    <div
      className="shrink-0 relative overflow-hidden shadow-[2px_4px_18px_rgba(6,3,45,0.06)]"
      style={{
        width: w,
        height: h,
        borderRadius: radius,
        background: '#0B0B0C',
      }}
    >
      <div
        className="absolute text-white font-['Aldrich',sans-serif] leading-[1.08] tracking-[0.01em]"
        style={{
          top: h * 0.09,
          left: w * 0.1,
          right: w * 0.1,
          fontSize: w * 0.15,
        }}
      >
        CREATIVE
        <br />
        POSTER
        <br />
        EXHIBIT
      </div>
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '42%',
          background: 'linear-gradient(180deg,#2b2b30 0%,#4a4a52 55%,#6b6b73 100%)',
        }}
      >
        {[18, 34, 50, 66, 82].map((l, i) => (
          <div
            key={i}
            className="absolute bottom-0 w-[3px] bg-[#101013] rounded-[1px]"
            style={{
              left: `${l}%`,
              height: `${28 + (i % 3) * 14}%`,
            }}
          />
        ))}
      </div>
      <div
        className="absolute text-white font-['Aldrich',sans-serif] tracking-[0.02em]"
        style={{
          bottom: h * 0.05,
          left: w * 0.1,
          fontSize: w * 0.088,
        }}
      >
        APRIL 3-5 2024
      </div>
    </div>
  );
}
