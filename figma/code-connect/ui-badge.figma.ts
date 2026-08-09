// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-14
// source=packages/ui/src/badge/badge.tsx
// component=Badge
import figma from 'figma'

export default {
  example: figma.code`
    <Badge tone="positive">Published</Badge>
  `,
  imports: ['import { Badge } from "@unpopping-candy/ui/badge"'],
  id: 'ui-badge',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.badge',
      storyId: 'catalog-ui-badge--contract',
    },
  },
}
