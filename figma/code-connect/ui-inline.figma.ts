// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-21
// source=packages/ui/src/inline/inline.tsx
// component=Inline
import figma from 'figma'

export default {
  example: figma.code`
    <Inline gap={3}><Button>Save</Button><Button variant="secondary">Cancel</Button></Inline>
  `,
  imports: ['import { Inline } from "@unpopping-candy/ui/layout"'],
  id: 'ui-inline',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.inline',
      storyId: 'catalog-ui-inline--contract',
    },
  },
}
