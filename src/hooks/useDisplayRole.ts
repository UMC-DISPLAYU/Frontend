import { useMemo } from 'react';

import type { DisplayDetailDto, UserProfileDto } from '@/api/dto';

type UserRole = 'owner' | 'member-verified' | 'member-unverified';

export const useDisplayRole = (
  displayDetail: DisplayDetailDto | undefined,
  currentUser: UserProfileDto | undefined,
): UserRole | null => {
  return useMemo(() => {
    if (!displayDetail || !currentUser) {
      return null;
    }

    // Check if current user is owner
    if (displayDetail.ownerUserId === currentUser.id) {
      return 'owner';
    }

    // Check if current user is a team member
    const member = displayDetail.teamMembers.find((m) => m.userId === currentUser.id);

    if (!member) {
      return 'member-unverified';
    }

    return member.accepted ? 'member-verified' : 'member-unverified';
  }, [displayDetail, currentUser]);
};
