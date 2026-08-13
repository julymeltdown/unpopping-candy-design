// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-19
// source=packages/ui/src/feedback/feedback-provider.tsx
// component=FeedbackProvider
import figma from 'figma'

export default {
  example: figma.code`
    <FeedbackProvider><App /></FeedbackProvider>
  `,
  imports: ['import { FeedbackProvider } from "@unpopping-candy/ui/feedback"'],
  id: 'ui-feedback-provider',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.feedback-provider',
      storyId: 'catalog-ui-feedbackprovider--contract',
    },
  },
}
