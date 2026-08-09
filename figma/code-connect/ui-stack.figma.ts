// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-25
// source=packages/ui/src/stack/stack.tsx
// component=Stack
import figma from 'figma'

export default {
  example: figma.code`
    <Stack gap="md"><TextField /><TextArea /></Stack>
  `,
  imports: ['import { Stack } from "@unpopping-candy/ui/layout"'],
  id: 'ui-stack',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.stack',
      storyId: 'catalog-ui-stack--contract',
    },
  },
}
