// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-25
// source=packages/ui/src/stack/stack.tsx
// component=Stack
import figma from 'figma'

export default {
  example: figma.code`
    <Stack gap="md"><TextField /><TextArea /></Stack>
  `,
  imports: ['import { Stack } from "@commonspace/ui/layout"'],
  id: 'ui-stack',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.stack',
      storyId: 'catalog-ui-stack--contract',
    },
  },
}
