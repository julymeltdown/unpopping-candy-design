// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-11
// source=packages/social/src/user-cell/user-cell.tsx
// component=UserCell
import figma from 'figma'

export default {
  example: figma.code`
    <UserCell user={user} onSelect={openProfile} actionLabel="Follow" onAction={followUser} />
  `,
  imports: ['import { UserCell } from "@unpopping-candy/social/user"'],
  id: 'social-user-cell',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.user-cell',
      storyId: 'catalog-social-user-cell--contract',
    },
  },
}
