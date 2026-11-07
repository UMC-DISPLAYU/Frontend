export type TermKey = 'over14' | 'service' | 'privacy' | 'location';

/** 약관 문서가 있는 항목. `over14`는 확인 항목이라 문서가 없다. */
export type PolicyTermKey = Exclude<TermKey, 'over14'>;

export type TermState = Record<TermKey, boolean>;
