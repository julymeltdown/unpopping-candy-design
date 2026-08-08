export interface SocialUserViewModel {
  id: string;
  handle: string;
  displayName: string;
  avatarUrl?: string | null | undefined;
  verified?: boolean | undefined;
  bio?: string | null | undefined;
}

export interface SocialMediaViewModel {
  id: string;
  kind: 'image' | 'video';
  url: string;
  alt: string;
  width: number;
  height: number;
  posterUrl?: string | null | undefined;
}

export interface SocialPostMetrics {
  replies: number;
  reposts: number;
  quotes?: number | undefined;
  likes: number;
  bookmarks: number;
  views?: number | undefined;
}

export interface SocialPostViewerState {
  liked: boolean;
  reposted: boolean;
  bookmarked: boolean;
  canReply?: boolean | undefined;
  canDelete?: boolean | undefined;
}

export interface SocialPostReference {
  id: string;
  handle: string;
}

export interface SocialPostSummary {
  id: string;
  author: SocialUserViewModel;
  text: string;
  media: readonly SocialMediaViewModel[];
}

export interface SocialTimelineDistribution {
  kind: 'direct' | 'repost';
  actor?: SocialUserViewModel | undefined;
  activityId?: string | undefined;
  distributedAt: string;
}

export interface SocialRecommendationReason {
  code: string;
  label: string;
}

export interface SocialTimelineContext {
  distribution: SocialTimelineDistribution;
  recommendationReason?: SocialRecommendationReason | undefined;
}

export interface SocialPostViewModel {
  id: string;
  author: SocialUserViewModel;
  text: string;
  createdAt: string;
  media: readonly SocialMediaViewModel[];
  metrics: SocialPostMetrics;
  viewerState: SocialPostViewerState;
  replyTo?: SocialPostReference | null | undefined;
  quotedPost?: SocialPostSummary | null | undefined;
  timelineContext?: SocialTimelineContext | null | undefined;
  edited?: boolean | undefined;
}

export interface SocialProfileViewModel {
  user: SocialUserViewModel;
  coverUrl?: string | null | undefined;
  location?: string | null | undefined;
  website?: string | null | undefined;
  joinedLabel?: string | null | undefined;
  followers: number;
  following: number;
  posts?: number | undefined;
  viewerRelationship?: 'self' | 'none' | 'following' | 'requested' | 'blocked' | undefined;
}

export interface SocialNotificationViewModel {
  id: string;
  type: 'reply' | 'mention' | 'like' | 'repost' | 'follow' | 'system';
  actors: readonly SocialUserViewModel[];
  message: string;
  createdAt: string;
  read: boolean;
  post?: SocialPostSummary | null | undefined;
}

export interface SocialConversationPreviewViewModel {
  id: string;
  participants: readonly SocialUserViewModel[];
  title: string;
  lastMessage: string;
  updatedAt: string;
  unreadCount: number;
  muted?: boolean | undefined;
}
