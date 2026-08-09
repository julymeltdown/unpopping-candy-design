// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-19
// source=packages/ui/src/feedback/feedback-provider.tsx
// component=FeedbackProvider
import figma from 'figma'

export default {
  example: figma.code`
    <FeedbackProvider><App /></FeedbackProvider>
  `,
  imports: ['import { FeedbackProvider } from "@commonspace/ui/feedback"'],
  id: 'ui-feedback-provider',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.feedback-provider',
      storyId: 'catalog-ui-feedback-provider--contract',
    },
  },
}
