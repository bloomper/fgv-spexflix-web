/** The kinds of record Spexflix's change log has. */
export const ENTITY_TYPES = ["VIDEO", "COLLECTION", "VIDEO_KIND", "SETTINGS"] as const;

/**
 * Where a record in the change log is edited.
 */
export function auditLink(entityType: string, entityId: string): string | null {
  switch (entityType) {
    case "VIDEO":
      return `/manage/videos/${entityId}`;
    case "COLLECTION":
      return `/manage/collections/${entityId}`;
    case "VIDEO_KIND":
      return "/admin/kinds";
    case "SETTINGS":
      return "/admin/settings";
    default:
      return null;
  }
}
