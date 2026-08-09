// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-31
// source=packages/ui/src/feedback/toast.tsx
// component=ToastViewport
import figma from 'figma'

export default {
  example: figma.code`
    <ToastViewport items={items} onDismiss={dismiss} />
  `,
  imports: ['import { ToastViewport } from "@commonspace/ui/feedback"'],
  id: 'ui-toast-viewport',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.toast-viewport',
      storyId: 'catalog-ui-toast-viewport--contract',
    },
  },
}
