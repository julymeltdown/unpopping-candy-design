// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-12
// source=packages/ui/src/alert/alert.tsx
// component=Alert
import figma from 'figma'

export default {
  example: figma.code`
    <Alert tone="warning" title="Could not refresh posts">Existing posts remain available.</Alert>
  `,
  imports: ['import { Alert } from "@unpopping-candy/ui/alert"'],
  id: 'ui-alert',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.alert',
      storyId: 'catalog-ui-alert--contract',
    },
  },
}
