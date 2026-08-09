// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-24
// source=packages/ui/src/spinner/spinner.tsx
// component=Spinner
import figma from 'figma'

export default {
  example: figma.code`
    <Spinner label="Saving changes" />
  `,
  imports: ['import { Spinner } from "@commonspace/ui/loading"'],
  id: 'ui-spinner',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.spinner',
      storyId: 'catalog-ui-spinner--contract',
    },
  },
}
