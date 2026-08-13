import { describe, expect, it, vi } from 'vitest';

import { FlowGuard } from './FlowGuard';

const mocks = vi.hoisted(() => ({
  completedSteps: new Set<string>(),
  location: { pathname: '/exhibition/104/artworks/add/participants' },
  completeStep: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  Navigate: ({ to, replace }: { to: string; replace?: boolean }) => (
    <div data-testid="navigate" data-replace={String(replace)} data-to={to} />
  ),
  useLocation: () => mocks.location,
}));

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();

  return {
    ...actual,
    useEffect: (effect: () => void) => effect(),
  };
});

vi.mock('@/components/guards/useFlowContext', () => ({
  useFlowContext: () => ({
    completeStep: mocks.completeStep,
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

  it('현재 경로에 맞는 flow 정의로 진입 가능 여부를 판단한다', () => {
    mocks.completedSteps = new Set(['artwork-basic']);
    mocks.location = { pathname: '/exhibition/104/artworks/add/participants' };

    const element = FlowGuard({
      steps: [
        {
          path: '/artworks/add/participants',
          step: 'artwork-participants',
          required: ['artwork-basic'],
          fallback: '/artworks/add/choice',
        },
      ],
      children: <div>Participants</div>,
    });

    expect(element.props.children.props.children).toBe('Participants');
  });

  it('현재 경로의 required 단계가 미완료되면 해당 flow fallback으로 이동한다', () => {
    mocks.completedSteps = new Set();
    mocks.location = { pathname: '/exhibition/104/artworks/add/participants' };

    const element = FlowGuard({
      steps: [
        {
          path: '/artworks/add/participants',
          step: 'artwork-participants',
          required: ['artwork-basic'],
          fallback: '/artworks/add/choice',
        },
      ],
      children: <div>Participants</div>,
    });

    expect(element.props).toMatchObject({
      to: '/exhibition/104/artworks/add/choice',
      replace: true,
    });
  });
});
