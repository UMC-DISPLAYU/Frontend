import { type ReactNode, useEffect } from 'react';

import { Navigate, Outlet, useParams } from 'react-router-dom';

import { FlowProvider } from '@/contexts/FlowContext';
import { useArtworkDetail } from '@/hooks/queries/useArtworkDetail';
import { useDisplayDetail } from '@/hooks/queries/useDisplayDetail';
import { useDisplayMembers } from '@/hooks/queries/useDisplayMembers';
import {
  useArtworkPolicy,
  useDisplayArtistNamePolicy,
  useDisplayContentPolicy,
  useDisplayCreatePolicy,
  useDisplayInvitationPolicy,
  useDisplayPolicy,
  usePersonalArtworkPolicy,
} from '@/hooks/usePolicy';
import type { ArtworkPolicyResource, DisplayPolicyResource } from '@/policies/util';

import { FlowGuard, type FlowStepDefinition } from './FlowGuard';
import { PermissionGuard } from './PermissionGuard';
import { useFlowContext } from './useFlowContext';

type GuardChildrenProps = {
  children: ReactNode;
};

type DisplayGuardProps = GuardChildrenProps & {
  action: 'edit' | 'delete';
  fallback?: string;
};

type DisplayArtistNameGuardProps = GuardChildrenProps & {
  action: 'edit';
  fallback?: string;
};

type ArtworkGuardProps = GuardChildrenProps & {
  action: 'create' | 'edit' | 'delete' | 'reorder';
  fallback?: string;
};

type DisplayContentGuardProps = GuardChildrenProps & {
  action:
    | 'createCategory'
    | 'editCategory'
    | 'deleteCategory'
    | 'createContent'
    | 'editContent'
    | 'deleteContent'
    | 'reorder';
  fallback?: string;
};

type DisplayInvitationGuardProps = GuardChildrenProps & {
  action: 'create';
  fallback?: string;
};

type PersonalArtworkGuardProps = GuardChildrenProps & {
  action: 'create';
  fallback?: string;
};

type FlowStepCompleteProps = GuardChildrenProps & {
  stepId: string;
};

type GuardedFlowStepProps = GuardChildrenProps & {
  required: string[];
  fallback: string;
  complete?: string;
};

type FlowRouteProps = {
  initialFlow: string;
  steps?: FlowStepDefinition[];
  children?: ReactNode;
};

type ResourceQueryState<T> = {
  resource: T | null;
  isPending: boolean;
  isError: boolean;
};

function GuardLoading() {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md items-center justify-center bg-page">
      <span className="typo-body-sm-regular text-faint">불러오는 중</span>
    </div>
  );
}

function useDisplayPolicyResource(): ResourceQueryState<DisplayPolicyResource> {
  const { displayId: paramDisplayId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);
  const displayQuery = useDisplayDetail(displayId);
  const memberQuery = useDisplayMembers(displayId);
  const display = displayQuery.data;
  const memberList = memberQuery.data;

  if (!display) {
    return {
      resource: null,
      isPending: displayQuery.isPending || memberQuery.isPending,
      isError: displayQuery.isError || memberQuery.isError,
    };
  }

  return {
    resource: {
      ownerUserId: display.ownerUserId ?? 0,
      teamMembers:
        display.teamMembers ??
        memberList?.members?.map((member) => ({
          userId: member.userId,
          accepted: member.accepted !== false,
        })) ??
        [],
    },
    isPending: false,
    isError: displayQuery.isError || memberQuery.isError,
  };
}

function useArtworkPolicyResource(): ResourceQueryState<ArtworkPolicyResource> {
  const { artworkId: paramArtworkId } = useParams();
  const artworkId = Number(paramArtworkId ?? 0);
  const artworkQuery = useArtworkDetail(artworkId);
  const artwork = artworkQuery.data;

  if (!artwork) {
    return {
      resource: null,
      isPending: artworkQuery.isPending,
      isError: artworkQuery.isError,
    };
  }

  return {
    resource: {
      artistUserId: artwork.artistUserId ?? 0,
      qaHandlers: artwork.qaHandlers,
      coAuthors: artwork.coAuthors,
    },
    isPending: false,
    isError: artworkQuery.isError,
  };
}

export function ArtistPermissionGuard({ children }: GuardChildrenProps) {
  return (
    <PermissionGuard resource="artist" action="view" fallback="/403">
      {children}
    </PermissionGuard>
  );
}

export function DisplayCreatePermissionGuard({
  fallback = '/403',
  children,
}: GuardChildrenProps & { fallback?: string }) {
  const createPolicy = useDisplayCreatePolicy();
  const policy = {
    create: createPolicy.create,
    edit: () => false,
    delete: () => false,
  };

  return (
    <PermissionGuard resource="display" action="create" fallback={fallback} policy={policy}>
      {children}
    </PermissionGuard>
  );
}

export function DisplayPermissionGuard({ action, fallback = '/403', children }: DisplayGuardProps) {
  const display = useDisplayPolicyResource();
  const policy = useDisplayPolicy(display.resource ?? { ownerUserId: 0, teamMembers: [] });

  if (display.isPending) return <GuardLoading />;
  if (display.isError || !display.resource) return <Navigate to={fallback} replace />;

  return (
    <PermissionGuard resource="display" action={action} fallback={fallback} policy={policy}>
      {children}
    </PermissionGuard>
  );
}

export function DisplayContentPermissionGuard({
  action,
  fallback = '/403',
  children,
}: DisplayContentGuardProps) {
  const display = useDisplayPolicyResource();
  const policy = useDisplayContentPolicy(display.resource ?? undefined);

  if (display.isPending) return <GuardLoading />;
  if (display.isError || !display.resource) return <Navigate to={fallback} replace />;

  return (
    <PermissionGuard resource="displayContent" action={action} fallback={fallback} policy={policy}>
      {children}
    </PermissionGuard>
  );
}

export function DisplayInvitationPermissionGuard({
  action,
  fallback = '/403',
  children,
}: DisplayInvitationGuardProps) {
  const display = useDisplayPolicyResource();
  const policy = useDisplayInvitationPolicy(
    display.resource ?? { ownerUserId: 0, teamMembers: [] },
  );

  if (display.isPending) return <GuardLoading />;
  if (display.isError || !display.resource) return <Navigate to={fallback} replace />;

  return (
    <PermissionGuard
      resource="displayInvitation"
      action={action}
      fallback={fallback}
      policy={policy}
    >
      {children}
    </PermissionGuard>
  );
}

export function PersonalArtworkPermissionGuard({
  action,
  fallback = '/403',
  children,
}: PersonalArtworkGuardProps) {
  const policy = usePersonalArtworkPolicy();

  return (
    <PermissionGuard resource="personalArtwork" action={action} fallback={fallback} policy={policy}>
      {children}
    </PermissionGuard>
  );
}

export function DisplayArtistNamePermissionGuard({
  action,
  fallback = '/403',
  children,
}: DisplayArtistNameGuardProps) {
  const display = useDisplayPolicyResource();
  const policy = useDisplayArtistNamePolicy(
    display.resource ?? { ownerUserId: 0, teamMembers: [] },
  );

  if (display.isPending) return <GuardLoading />;
  if (display.isError || !display.resource) return <Navigate to={fallback} replace />;

  return (
    <PermissionGuard
      resource="displayArtistName"
      action={action}
      fallback={fallback}
      policy={policy}
    >
      {children}
    </PermissionGuard>
  );
}

export function ArtworkPermissionGuard({ action, fallback = '/403', children }: ArtworkGuardProps) {
  const display = useDisplayPolicyResource();
  const artwork = useArtworkPolicyResource();
  const policy = useArtworkPolicy(display.resource ?? undefined, artwork.resource ?? undefined);

  if (display.isPending || (action !== 'create' && artwork.isPending)) return <GuardLoading />;
  if (display.isError || !display.resource || (action !== 'create' && !artwork.resource)) {
    return <Navigate to={fallback} replace />;
  }

  return (
    <PermissionGuard resource="artwork" action={action} fallback={fallback} policy={policy}>
      {children}
    </PermissionGuard>
  );
}

export function FlowStepComplete({ stepId, children }: FlowStepCompleteProps) {
  const { completeStep } = useFlowContext();

  useEffect(() => {
    completeStep(stepId);
  }, [completeStep, stepId]);

  return <>{children}</>;
}

export function GuardedFlowStep({ required, fallback, complete, children }: GuardedFlowStepProps) {
  const content = complete ? (
    <FlowStepComplete stepId={complete}>{children}</FlowStepComplete>
  ) : (
    children
  );

  return (
    <FlowGuard required={required} fallback={fallback}>
      {content}
    </FlowGuard>
  );
}

export function FlowRoute({ initialFlow, steps, children }: FlowRouteProps) {
  return (
    <FlowProvider initialFlow={initialFlow}>
      {steps ? (
        <FlowGuard steps={steps}>{children ?? <Outlet />}</FlowGuard>
      ) : (
        (children ?? <Outlet />)
      )}
    </FlowProvider>
  );
}
