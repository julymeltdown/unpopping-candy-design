// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-20
// source=packages/ui/src/icon-button/icon-button.tsx
// component=IconButton
import figma from 'figma'

export default {
  example: figma.code`
    <IconButton label="Bookmark post" icon={<BookmarkIcon />} />
  `,
  imports: ['import { IconButton } from "@unpopping-candy/ui/button"'],
  id: 'ui-icon-button',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.icon-button',
      storyId: 'catalog-ui-icon-button--contract',
    },
  },
}
