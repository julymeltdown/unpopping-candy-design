// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-4
// source=packages/social/src/post-card/post-card.tsx
// component=PostCard
import figma from 'figma'

export default {
  example: figma.code`
    <PostCard post={post} onLike={() => onLike(post.id)} onOpenPost={() => open(post.id)} />
  `,
  imports: ['import { PostCard } from "@unpopping-candy/social/post"'],
  id: 'social-post-card',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-card',
      storyId: 'catalog-social-post-card--contract',
    },
  },
}
