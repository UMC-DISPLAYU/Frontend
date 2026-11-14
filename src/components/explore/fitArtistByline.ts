const label = (names: string[], shown: number) =>
  shown >= names.length
    ? names.join(', ')
    : `${names.slice(0, shown).join(', ')} 외 ${names.length - shown}명`;

/**
 * 카드 작가 표기(프로토타입 11-06): 이름을 ", "로 이어 한 줄에 최대한 다 보여주고,
 * 넘치면 들어가는 만큼만 남기고 " 외 N명"을 붙인다. 첫 이름도 안 들어가면 말줄임은 CSS가 한다
 */
export function fitArtistByline(names: string[], fits: (text: string) => boolean) {
  for (let shown = names.length; shown > 1; shown--) {
    const text = label(names, shown);
    if (fits(text)) return text;
  }
  return label(names, 1);
}
