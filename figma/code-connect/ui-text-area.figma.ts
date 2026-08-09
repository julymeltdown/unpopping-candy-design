// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-28
// source=packages/ui/src/text-area/text-area.tsx
// component=TextArea
import figma from 'figma'

export default {
  example: figma.code`
    <TextArea label="Biography" error={errors.bio} />
  `,
  imports: ['import { TextArea } from "@commonspace/ui/forms"'],
  id: 'ui-text-area',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.text-area',
      storyId: 'catalog-ui-text-area--contract',
    },
  },
}
