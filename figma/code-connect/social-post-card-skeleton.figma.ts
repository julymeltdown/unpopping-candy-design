// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-5
// source=packages/social/src/post-card/post-card-skeleton.tsx
// component=PostCardSkeleton
import figma from 'figma'

export default {
  example: figma.code`
    <PostCardSkeleton />
  `,
  imports: ['import { PostCardSkeleton } from "@commonspace/social/post"'],
  id: 'social-post-card-skeleton',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-card-skeleton',
      storyId: 'catalog-social-post-card-skeleton--contract',
    },
  },
}
