import { create } from 'zustand';

export const TOAST_DURATION_MS = 3000;
/** 닫힘 애니메이션(base 300ms)의 animationend 가 오지 않을 때 대신 지우는 시간 */
export const TOAST_EXIT_FALLBACK_MS = 600;

export interface ToastItem {
  id: number;
  message: string;
  isClosing: boolean;
}

interface ToastState {
  toast: ToastItem | null;
}

interface ToastOptions {
  duration?: number;
}

export const useToastStore = create<ToastState>(() => ({ toast: null }));

let nextId = 1;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
let removeTimer: ReturnType<typeof setTimeout> | undefined;

const clearTimers = () => {
  clearTimeout(hideTimer);
  clearTimeout(removeTimer);
  hideTimer = undefined;
  removeTimer = undefined;
};

/** 토스트는 한 번에 하나만 보인다. 떠 있는 중에 다시 부르면 새 문구로 바꾸고 시간을 처음부터 센다 */
export function toast(message: string, { duration = TOAST_DURATION_MS }: ToastOptions = {}) {
  clearTimers();

  const id = nextId++;
  useToastStore.setState({ toast: { id, message, isClosing: false } });
  hideTimer = setTimeout(() => dismissToast(id), duration);

  return id;
}

/** 닫힘 애니메이션을 시작한다. id 를 주면 그 토스트가 아직 떠 있을 때만 닫는다 */
export function dismissToast(id?: number) {
  const current = useToastStore.getState().toast;

  if (!current || current.isClosing || (id !== undefined && current.id !== id)) return;

  clearTimers();
  useToastStore.setState({ toast: { ...current, isClosing: true } });
  removeTimer = setTimeout(() => removeToast(current.id), TOAST_EXIT_FALLBACK_MS);
}

/** 닫힘 애니메이션이 끝나면 Toaster 가 부른다 */
export function removeToast(id: number) {
  if (useToastStore.getState().toast?.id !== id) return;

  clearTimers();
  useToastStore.setState({ toast: null });
}
