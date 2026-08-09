// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-6
// source=packages/social/src/post-composer/post-composer-view.tsx
// component=PostComposerView
import figma from 'figma'

export default {
  example: figma.code`
    <PostComposerView value={draft} onChange={setDraft} onSubmit={publish} pending={pending} />
  `,
  imports: ['import { PostComposerView } from "@commonspace/social/post"'],
  id: 'social-post-composer-view',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-composer-view',
      storyId: 'catalog-social-post-composer-view--contract',
    },
  },
}
