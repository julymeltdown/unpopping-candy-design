// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-7
// source=packages/social/src/post-card/post-header.tsx
// component=PostHeader
import figma from 'figma'

export default {
  example: figma.code`
    <PostHeader author={post.author} createdAt={post.createdAt} onOpenAuthor={openAuthor} />
  `,
  imports: ['import { PostHeader } from "@unpopping-candy/social/post"'],
  id: 'social-post-header',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-header',
      storyId: 'catalog-social-postheader--contract',
    },
  },
}
