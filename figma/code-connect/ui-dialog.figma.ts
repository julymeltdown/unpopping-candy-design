// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-17
// source=packages/ui/src/dialog/dialog.tsx
// component=Dialog
import figma from 'figma'

export default {
  example: figma.code`
    <Dialog open={open} onOpenChange={setOpen} title="Delete post?">...</Dialog>
  `,
  imports: ['import { Dialog } from "@unpopping-candy/ui/dialog"'],
  id: 'ui-dialog',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.dialog',
      storyId: 'catalog-ui-dialog--contract',
    },
  },
}
