export interface User {
  id: number | null;
  isArtistVerified: boolean;
}

export type PolicyActionMap = {
  artist: 'view';
  display: 'create' | 'edit' | 'delete';
  displayArtistName: 'edit';
  displayContent:
    | 'createCategory'
    | 'editCategory'
    | 'deleteCategory'
    | 'createContent'
    | 'editContent'
    | 'deleteContent'
    | 'reorder';
  displayInvitation: 'create';
  artwork: 'create' | 'edit' | 'delete' | 'reorder';
  question:
    | 'view'
    | 'create'
    | 'delete'
    | 'like'
    | 'unlike'
    | 'reply.view'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  feeling:
    | 'create'
    | 'delete'
    | 'like'
    | 'unlike'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  displayReview:
    | 'create'
    | 'like'
    | 'unlike'
    | 'delete'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  personalArtwork: 'create' | 'like' | 'unlike' | 'edit' | 'delete';
  personalQuestion:
    | 'view'
    | 'create'
    | 'delete'
    | 'like'
    | 'unlike'
    | 'reply.view'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  personalFeeling:
    | 'create'
    | 'like'
    | 'unlike'
    | 'delete'
    | 'reply.create'
    | 'reply.like'
    | 'reply.unlike'
    | 'reply.delete';
  loungePost: 'create' | 'edit' | 'delete' | 'like' | 'unlike' | 'scrap';
  loungeComment: 'create' | 'delete' | 'like' | 'unlike';
  archive: 'create' | 'delete';
  memo: 'view' | 'upsert' | 'delete';
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
