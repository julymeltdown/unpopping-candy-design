// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-22
// source=packages/ui/src/separator/separator.tsx
// component=Separator
import figma from 'figma'

export default {
  example: figma.code`
    <Separator />
  `,
  imports: ['import { Separator } from "@unpopping-candy/ui/layout"'],
  id: 'ui-separator',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.separator',
      storyId: 'catalog-ui-separator--contract',
    },
  },
}
