// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-15
// source=packages/ui/src/button/button.tsx
// component=Button
import figma from 'figma'

export default {
  example: figma.code`
    <Button pending={isSaving}>Save changes</Button>
  `,
  imports: ['import { Button } from "@unpopping-candy/ui/button"'],
  id: 'ui-button',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.button',
      storyId: 'catalog-ui-button--contract',
    },
  },
}
