// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-32
// source=packages/ui/src/visually-hidden/visually-hidden.tsx
// component=VisuallyHidden
import figma from 'figma'

export default {
  example: figma.code`
    <Spinner><VisuallyHidden>Loading posts</VisuallyHidden></Spinner>
  `,
  imports: ['import { VisuallyHidden } from "@commonspace/ui"'],
  id: 'ui-visually-hidden',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.visually-hidden',
      storyId: 'catalog-ui-visually-hidden--contract',
    },
  },
}
