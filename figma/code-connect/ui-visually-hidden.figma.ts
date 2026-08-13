// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-32
// source=packages/ui/src/visually-hidden/visually-hidden.tsx
// component=VisuallyHidden
import figma from 'figma'

export default {
  example: figma.code`
    <Spinner><VisuallyHidden>Loading posts</VisuallyHidden></Spinner>
  `,
  imports: ['import { VisuallyHidden } from "@unpopping-candy/ui"'],
  id: 'ui-visually-hidden',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.visually-hidden',
      storyId: 'catalog-ui-visuallyhidden--contract',
    },
  },
}
