import { describe, expect, it, vi } from 'vitest';

import { FlowGuard } from './FlowGuard';

const mocks = vi.hoisted(() => ({
  completedSteps: new Set<string>(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate" data-replace={String(replace)} data-to={to} />
  ),
}));

vi.mock('@/components/guards/useFlowContext', () => ({
  useFlowContext: () => ({
    isStepCompleted: (stepId: string) => mocks.completedSteps.has(stepId),
  }),
}));

describe('FlowGuard', () => {
  it('required 단계가 모두 완료되면 children을 렌더링한다', () => {
    mocks.completedSteps = new Set(['display-basic', 'display-artworks']);

    const element = FlowGuard({
      required: ['display-basic', 'display-artworks'],
      fallback: '/display/manage',
      children: <div>Flow Content</div>,
    });

    expect(element.props.children.props.children).toBe('Flow Content');
  });

  it('required 단계 중 하나라도 미완료되면 fallback으로 replace 이동한다', () => {
    mocks.completedSteps = new Set(['display-basic']);

    const element = FlowGuard({
      required: ['display-basic', 'display-artworks'],
      fallback: '/display/manage',
      children: <div>Flow Content</div>,
    });

    expect(element.type).toBeTypeOf('function');
    expect(element.props).toMatchObject({
      to: '/display/manage',
      replace: true,
    });
  });
});
