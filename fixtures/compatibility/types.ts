export type CompatibilityFixtureId =
  | "base"
  | "publish-post"
  | "member-moderation"
  | "activity-review";

export interface CompatibilityScenario {
  readonly fixtureId: CompatibilityFixtureId;
  readonly expectedAccessibleName: string;
}
