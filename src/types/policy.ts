export interface User {
  id: number | null;
  isArtistVerified: boolean;
}

export type PolicyActionMap = {
  display: 'view' | 'edit' | 'inviteMember' | 'delete' | 'forceDeleteArtwork';
  displayContent:
    | 'createCategory'
    | 'editCategory'
    | 'deleteCategory'
    | 'createContent'
    | 'editContent'
    | 'deleteContent'
    | 'reorder';
  displayInvitation: 'create' | 'accept' | 'reject';
  artwork: 'view' | 'create' | 'edit' | 'delete';
  question:
    | 'view'
    | 'create'
    | 'edit'
    | 'delete'
    | 'like'
    | 'unlike'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  feeling:
    | 'view'
    | 'create'
    | 'edit'
    | 'delete'
    | 'like'
    | 'unlike'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  displayReview:
    | 'view'
    | 'create'
    | 'like'
    | 'unlike'
    | 'delete'
    | 'reply.view'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  personalArtwork: 'view' | 'create' | 'like' | 'unlike' | 'edit' | 'delete';
  personalQuestion:
    | 'view'
    | 'create'
    | 'delete'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  personalFeeling:
    | 'view'
    | 'create'
    | 'like'
    | 'unlike'
    | 'delete'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  loungePost: 'view' | 'create' | 'edit' | 'delete' | 'like' | 'unlike' | 'scrap' | 'unscrap';
  loungeComment: 'view' | 'create' | 'delete' | 'like' | 'unlike';
  archive: 'create' | 'delete';
  memo: 'upsert' | 'delete';
};

export type PolicyResource = keyof PolicyActionMap;

export type PolicyAction<Resource extends PolicyResource> = PolicyActionMap[Resource];

export type PermissionMap<Action extends string = string> = Record<Action, () => boolean>;

export type PolicyPermissionMap<Resource extends PolicyResource> = PermissionMap<
  PolicyAction<Resource>
>;

type PolicyRule = (...args: never[]) => boolean;

type UnionToIntersection<T> = (T extends unknown ? (value: T) => void : never) extends (
  value: infer I,
) => void
  ? I
  : never;

type PolicyActionDefinition<Action extends string> = Action extends `${infer Head}.${infer Tail}`
  ? { [Key in Head]: PolicyActionDefinition<Tail> }
  : { [Key in Action]: PolicyRule };

type PolicyResourceDefinition<Resource extends PolicyResource> = UnionToIntersection<
  PolicyActionDefinition<PolicyAction<Resource>>
>;

export type PolicyDefinitionMap = {
  [Resource in PolicyResource]: PolicyResourceDefinition<Resource>;
};
