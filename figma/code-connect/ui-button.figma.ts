// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-15
// source=packages/ui/src/button/button.tsx
// component=Button
import figma from 'figma'

export default {
  example: figma.code`
    <Button pending={isSaving}>Save changes</Button>
  `,
  imports: ['import { Button } from "@commonspace/ui/button"'],
  id: 'ui-button',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.button',
      storyId: 'catalog-ui-button--contract',
    },
  },
}
