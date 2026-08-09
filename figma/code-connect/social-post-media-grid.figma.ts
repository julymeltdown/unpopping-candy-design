// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-8
// source=packages/social/src/post-card/post-media-grid.tsx
// component=PostMediaGrid
import figma from 'figma'

export default {
  example: figma.code`
    <PostMediaGrid media={post.media} onOpenMedia={openMedia} />
  `,
  imports: ['import { PostMediaGrid } from "@commonspace/social/post"'],
  id: 'social-post-media-grid',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-media-grid',
      storyId: 'catalog-social-post-media-grid--contract',
    },
  },
}
