// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-23
// source=packages/ui/src/skeleton/skeleton.tsx
// component=Skeleton
import figma from 'figma'

export default {
  example: figma.code`
    <Skeleton aria-hidden style={{ height: 160 }} />
  `,
  imports: ['import { Skeleton } from "@commonspace/ui/loading"'],
  id: 'ui-skeleton',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.skeleton',
      storyId: 'catalog-ui-skeleton--contract',
    },
  },
}
