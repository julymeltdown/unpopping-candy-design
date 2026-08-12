// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-6
// source=packages/social/src/post-composer/post-composer-view.tsx
// component=PostComposerView
import figma from 'figma'

export default {
  example: figma.code`
    <PostComposerView viewer={viewer} value={draft} onValueChange={setDraft} onSubmit={publish} pending={pending} />
  `,
  imports: ['import { PostComposerView } from "@unpopping-candy/social/post"'],
  id: 'social-post-composer-view',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.post-composer-view',
      storyId: 'catalog-social-post-composer-view--contract',
    },
  },
}
