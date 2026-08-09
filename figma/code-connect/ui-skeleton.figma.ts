// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-23
// source=packages/ui/src/skeleton/skeleton.tsx
// component=Skeleton
import figma from 'figma'

export default {
  example: figma.code`
    <Skeleton aria-hidden style={{ height: 160 }} />
  `,
  imports: ['import { Skeleton } from "@unpopping-candy/ui/loading"'],
  id: 'ui-skeleton',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.skeleton',
      storyId: 'catalog-ui-skeleton--contract',
    },
  },
}
