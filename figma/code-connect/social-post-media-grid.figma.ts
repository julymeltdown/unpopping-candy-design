// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-8
// source=packages/social/src/post-card/post-media-grid.tsx
// component=PostMediaGrid
import figma from 'figma'

export default {
  example: figma.code`
    <PostMediaGrid media={post.media} onOpenMedia={openMedia} />
  `,
  imports: ['import { PostMediaGrid } from "@unpopping-candy/social/post"'],
  id: 'social-post-media-grid',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-media-grid',
      storyId: 'catalog-social-post-media-grid--contract',
    },
  },
}
