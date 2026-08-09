// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-30
// source=packages/ui/src/feedback/toast.tsx
// component=Toast
import figma from 'figma'

export default {
  example: figma.code`
    feedback.show({ tone: 'success', title: 'Link copied' })
  `,
  imports: ['import { Toast } from "@commonspace/ui/feedback"'],
  id: 'ui-toast',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.toast',
      storyId: 'catalog-ui-toast--contract',
    },
  },
}
