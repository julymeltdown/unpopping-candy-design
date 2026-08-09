// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-13
// source=packages/ui/src/avatar/avatar.tsx
// component=Avatar
import figma from 'figma'

export default {
  example: figma.code`
    <Avatar src={user.avatarUrl} name={user.displayName} />
  `,
  imports: ['import { Avatar } from "@unpopping-candy/ui/avatar"'],
  id: 'ui-avatar',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.avatar',
      storyId: 'catalog-ui-avatar--contract',
    },
  },
}
