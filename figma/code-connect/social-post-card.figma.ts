// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-4
// source=packages/social/src/post-card/post-card.tsx
// component=PostCard
import figma from 'figma'

export default {
  example: figma.code`
    <PostCard post={post} onLike={() => onLike(post.id)} onOpenPost={() => open(post.id)} />
  `,
  imports: ['import { PostCard } from "@commonspace/social/post"'],
  id: 'social-post-card',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-card',
      storyId: 'catalog-social-post-card--contract',
    },
  },
}
