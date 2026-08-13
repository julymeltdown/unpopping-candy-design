// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-31
// source=packages/ui/src/feedback/toast.tsx
// component=ToastViewport
import figma from 'figma'

export default {
  example: figma.code`
    <ToastViewport items={items} onDismiss={dismiss} />
  `,
  imports: ['import { ToastViewport } from "@unpopping-candy/ui/feedback"'],
  id: 'ui-toast-viewport',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.toast-viewport',
      storyId: 'catalog-ui-toastviewport--contract',
    },
  },
}
