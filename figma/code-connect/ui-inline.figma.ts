// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-21
// source=packages/ui/src/inline/inline.tsx
// component=Inline
import figma from 'figma'

export default {
  example: figma.code`
    <Inline gap="sm"><Button>Save</Button><Button variant="secondary">Cancel</Button></Inline>
  `,
  imports: ['import { Inline } from "@commonspace/ui/layout"'],
  id: 'ui-inline',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.inline',
      storyId: 'catalog-ui-inline--contract',
    },
  },
}
