// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-7
// source=packages/social/src/post-card/post-header.tsx
// component=PostHeader
import figma from 'figma'

export default {
  example: figma.code`
    <PostHeader post={post} onOpenAuthor={openAuthor} />
  `,
  imports: ['import { PostHeader } from "@commonspace/social/post"'],
  id: 'social-post-header',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-header',
      storyId: 'catalog-social-post-header--contract',
    },
  },
}
