// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-13
// source=packages/ui/src/avatar/avatar.tsx
// component=Avatar
import figma from 'figma'

export default {
  example: figma.code`
    <Avatar src={user.avatarUrl} name={user.displayName} />
  `,
  imports: ['import { Avatar } from "@commonspace/ui/avatar"'],
  id: 'ui-avatar',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.avatar',
      storyId: 'catalog-ui-avatar--contract',
    },
  },
}
