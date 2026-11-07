import { describe, expect, it } from 'vitest';

import {
  computeFocusScrollDelta,
  computeKeyboardInset,
  detectKeyboardOpen,
  isTextEditableElement,
} from './virtualKeyboard';

describe('computeKeyboardInset', () => {
  const base = { layoutHeight: 800, viewportHeight: 800, viewportOffsetTop: 0, scale: 1 };

  it('키보드가 없으면 0', () => {
    expect(computeKeyboardInset(base)).toBe(0);
  });

  it('iOS: visual viewport 가 줄어든 만큼이 키보드 높이', () => {
    expect(computeKeyboardInset({ ...base, viewportHeight: 464 })).toBe(336);
  });

  it('iOS: 화면이 밀려 올라간(offsetTop) 만큼은 빼고 계산한다', () => {
    expect(computeKeyboardInset({ ...base, viewportHeight: 464, viewportOffsetTop: 120 })).toBe(
      216,
    );
  });

  it('레이아웃도 같이 줄어드는 브라우저(구버전 Android Chrome 등)는 0', () => {
    expect(computeKeyboardInset({ ...base, layoutHeight: 464, viewportHeight: 464 })).toBe(0);
  });

  it('핀치 줌 중에는 따라가지 않는다', () => {
    expect(computeKeyboardInset({ ...base, viewportHeight: 400, scale: 2 })).toBe(0);
    expect(computeKeyboardInset({ ...base, viewportHeight: 464, scale: 1.005 })).toBe(336);
  });

  it('작은 차이(툴바 · 반올림)는 무시한다: 40px 경계', () => {
    expect(computeKeyboardInset({ ...base, viewportHeight: 761 })).toBe(0);
    expect(computeKeyboardInset({ ...base, viewportHeight: 760 })).toBe(40);
  });

  it('소수점은 반올림한다', () => {
    expect(computeKeyboardInset({ ...base, viewportHeight: 463.6 })).toBe(336);
  });
});

describe('detectKeyboardOpen', () => {
  const base = { inset: 0, layoutHeight: 800, baselineLayoutHeight: 800, hasEditableFocus: true };

  it('inset 이 있으면 열림', () => {
    expect(detectKeyboardOpen({ ...base, inset: 300, hasEditableFocus: false })).toBe(true);
  });

  it('입력창 포커스 + 레이아웃이 120px 이상 줄면 열림(Android)', () => {
    expect(detectKeyboardOpen({ ...base, layoutHeight: 680 })).toBe(true);
    expect(detectKeyboardOpen({ ...base, layoutHeight: 681 })).toBe(false);
  });

  it('입력창 포커스가 없으면 높이가 줄어도 닫힘(주소창 등)', () => {
    expect(detectKeyboardOpen({ ...base, layoutHeight: 500, hasEditableFocus: false })).toBe(false);
  });
});

describe('computeFocusScrollDelta', () => {
  const visible = { visibleTop: 0, visibleBottom: 400, margin: 16 };

  it('보이는 영역 안이면 0', () => {
    expect(computeFocusScrollDelta({ ...visible, targetTop: 100, targetBottom: 150 })).toBe(0);
  });

  it('하단(바 포함)에 가리면 그만큼 아래로', () => {
    expect(computeFocusScrollDelta({ ...visible, targetTop: 380, targetBottom: 430 })).toBe(46);
  });

  it('경계: 아래 여백선에 딱 맞으면 0', () => {
    expect(computeFocusScrollDelta({ ...visible, targetTop: 334, targetBottom: 384 })).toBe(0);
  });

  it('위로 벗어나면 위로', () => {
    expect(computeFocusScrollDelta({ ...visible, targetTop: -50, targetBottom: 0 })).toBe(-66);
  });

  it('보이는 영역보다 큰 요소는 윗부분이 보이면 그대로, 아니면 윗부분에 맞춘다', () => {
    expect(computeFocusScrollDelta({ ...visible, targetTop: 50, targetBottom: 900 })).toBe(0);
    expect(computeFocusScrollDelta({ ...visible, targetTop: 500, targetBottom: 1400 })).toBe(484);
  });

  it('보이는 영역이 여백보다 작으면 건드리지 않는다', () => {
    expect(
      computeFocusScrollDelta({
        visibleTop: 0,
        visibleBottom: 20,
        targetTop: 300,
        targetBottom: 320,
      }),
    ).toBe(0);
  });
});

describe('isTextEditableElement', () => {
  const el = (props: Record<string, unknown>) => props as unknown as Element;

  it('텍스트 입력 · textarea · contenteditable 은 true', () => {
    expect(isTextEditableElement(el({ tagName: 'INPUT', type: 'text' }))).toBe(true);
    expect(isTextEditableElement(el({ tagName: 'INPUT', type: 'search' }))).toBe(true);
    expect(isTextEditableElement(el({ tagName: 'TEXTAREA' }))).toBe(true);
    expect(isTextEditableElement(el({ tagName: 'DIV', isContentEditable: true }))).toBe(true);
  });

  it('키보드가 뜨지 않는 요소 · 읽기 전용 · 비활성은 false', () => {
    expect(isTextEditableElement(null)).toBe(false);
    expect(isTextEditableElement(el({ tagName: 'INPUT', type: 'checkbox' }))).toBe(false);
    expect(isTextEditableElement(el({ tagName: 'INPUT', type: 'text', readOnly: true }))).toBe(
      false,
    );
    expect(isTextEditableElement(el({ tagName: 'TEXTAREA', disabled: true }))).toBe(false);
    expect(isTextEditableElement(el({ tagName: 'BUTTON' }))).toBe(false);
  });
});
