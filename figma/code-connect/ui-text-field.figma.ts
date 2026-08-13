// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-29
// source=packages/ui/src/text-field/text-field.tsx
// component=TextField
import figma from 'figma'

export default {
  example: figma.code`
    <TextField label="Email" type="email" autoComplete="email" />
  `,
  imports: ['import { TextField } from "@unpopping-candy/ui/forms"'],
  id: 'ui-text-field',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.text-field',
      storyId: 'catalog-ui-textfield--contract',
    },
  },
}
