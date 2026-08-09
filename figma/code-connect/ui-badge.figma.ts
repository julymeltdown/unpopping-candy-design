// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-14
// source=packages/ui/src/badge/badge.tsx
// component=Badge
import figma from 'figma'

export default {
  example: figma.code`
    <Badge tone="positive">Published</Badge>
  `,
  imports: ['import { Badge } from "@commonspace/ui/badge"'],
  id: 'ui-badge',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.badge',
      storyId: 'catalog-ui-badge--contract',
    },
  },
}
