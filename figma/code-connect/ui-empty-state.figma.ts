// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-18
// source=packages/ui/src/empty-state/empty-state.tsx
// component=EmptyState
import figma from 'figma'

export default {
  example: figma.code`
    <EmptyState title="No matching curators" description="Try a broader search." />
  `,
  imports: ['import { EmptyState } from "@commonspace/ui"'],
  id: 'ui-empty-state',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.empty-state',
      storyId: 'catalog-ui-empty-state--contract',
    },
  },
}
