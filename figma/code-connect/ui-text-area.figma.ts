// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-28
// source=packages/ui/src/text-area/text-area.tsx
// component=TextArea
import figma from 'figma'

export default {
  example: figma.code`
    <TextArea label="Biography" error={errors.bio} />
  `,
  imports: ['import { TextArea } from "@unpopping-candy/ui/forms"'],
  id: 'ui-text-area',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.text-area',
      storyId: 'catalog-ui-textarea--contract',
    },
  },
}
