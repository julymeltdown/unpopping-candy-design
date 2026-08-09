// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-3
// source=packages/social/src/post-card/post-actions.tsx
// component=PostActions
import figma from 'figma'

export default {
  example: figma.code`
    <PostActions post={post} onLike={onLike} pendingAction={pending} />
  `,
  imports: ['import { PostActions } from "@unpopping-candy/social/post"'],
  id: 'social-post-actions',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-actions',
      storyId: 'catalog-social-post-actions--contract',
    },
  },
}
