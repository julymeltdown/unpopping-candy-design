// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-30
// source=packages/ui/src/feedback/toast.tsx
// component=Toast
import figma from 'figma'

export default {
  example: figma.code`
    feedback.show({ tone: 'success', title: 'Link copied' })
  `,
  imports: ['import { Toast } from "@unpopping-candy/ui/feedback"'],
  id: 'ui-toast',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.toast',
      storyId: 'catalog-ui-toast--contract',
    },
  },
}
