// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-26
// source=packages/ui/src/surface/surface.tsx
// component=Surface
import figma from 'figma'

export default {
  example: figma.code`
    <Surface tone="subtle"><Stack>...</Stack></Surface>
  `,
  imports: ['import { Surface } from "@unpopping-candy/ui/layout"'],
  id: 'ui-surface',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.surface',
      storyId: 'catalog-ui-surface--contract',
    },
  },
}
