// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-11
// source=packages/social/src/user-cell/user-cell.tsx
// component=UserCell
import figma from 'figma'

export default {
  example: figma.code`
    <UserCell user={user} onSelect={openProfile} action={<FollowButton />} />
  `,
  imports: ['import { UserCell } from "@commonspace/social/user"'],
  id: 'social-user-cell',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.user-cell',
      storyId: 'catalog-social-user-cell--contract',
    },
  },
}
