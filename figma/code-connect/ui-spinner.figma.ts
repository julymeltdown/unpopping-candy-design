// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-24
// source=packages/ui/src/spinner/spinner.tsx
// component=Spinner
import figma from 'figma'

export default {
  example: figma.code`
    <Spinner label="Saving changes" />
  `,
  imports: ['import { Spinner } from "@unpopping-candy/ui/loading"'],
  id: 'ui-spinner',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.spinner',
      storyId: 'catalog-ui-spinner--contract',
    },
  },
}
