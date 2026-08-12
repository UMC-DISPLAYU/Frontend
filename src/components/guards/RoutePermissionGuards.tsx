import { type ReactNode, useEffect } from 'react';

import { Outlet, useParams } from 'react-router-dom';

import { FlowProvider } from '@/contexts/flowContext';
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

import { FlowGuard } from './FlowGuard';
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
  children?: ReactNode;
};

function useDisplayPolicyResource(): DisplayPolicyResource | null {
  const { displayId: paramDisplayId } = useParams();
  const displayId = Number(paramDisplayId ?? 0);
  const { data: display } = useDisplayDetail(displayId);
  const { data: memberList } = useDisplayMembers(displayId);

  if (!display) return null;

  return {
    ownerUserId: display.ownerUserId ?? 0,
    teamMembers:
      display.teamMembers ??
      memberList?.members?.map((member) => ({
        userId: member.userId,
        accepted: member.accepted !== false,
      })) ??
      [],
  };
}

function useArtworkPolicyResource(): ArtworkPolicyResource | undefined {
  const { artworkId: paramArtworkId } = useParams();
  const artworkId = Number(paramArtworkId ?? 0);
  const { data: artwork } = useArtworkDetail(artworkId);

  if (!artwork) return undefined;

  return {
    artistUserId: artwork.artistUserId ?? 0,
    qaHandlers: artwork.qaHandlers,
    coAuthors: artwork.coAuthors,
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
  const policy = useDisplayPolicy(display ?? { ownerUserId: 0, teamMembers: [] });

  if (!display) return null;

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
  const policy = useDisplayContentPolicy(display ?? undefined);

  if (!display) return null;

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
  const policy = useDisplayInvitationPolicy(display ?? { ownerUserId: 0, teamMembers: [] });

  if (!display) return null;

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
  const policy = useDisplayArtistNamePolicy(display ?? { ownerUserId: 0, teamMembers: [] });

  if (!display) return null;

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
  const policy = useArtworkPolicy(display ?? undefined, artwork);

  if (!display || (action !== 'create' && !artwork)) return null;

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

export function FlowRoute({ initialFlow, children }: FlowRouteProps) {
  return <FlowProvider initialFlow={initialFlow}>{children ?? <Outlet />}</FlowProvider>;
}
