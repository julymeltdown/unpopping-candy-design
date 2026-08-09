// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-20
// source=packages/ui/src/icon-button/icon-button.tsx
// component=IconButton
import figma from 'figma'

export default {
  example: figma.code`
    <IconButton aria-label="Bookmark post"><BookmarkIcon /></IconButton>
  `,
  imports: ['import { IconButton } from "@commonspace/ui/button"'],
  id: 'ui-icon-button',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.icon-button',
      storyId: 'catalog-ui-icon-button--contract',
    },
  },
}
