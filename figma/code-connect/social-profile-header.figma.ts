// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-9
// source=packages/social/src/profile/profile-header.tsx
// component=ProfileHeader
import figma from 'figma'

export default {
  example: figma.code`
    <ProfileHeader profile={profile} primaryAction={<FollowButton />} />
  `,
  imports: ['import { ProfileHeader } from "@unpopping-candy/social/profile"'],
  id: 'social-profile-header',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.profile-header',
      storyId: 'catalog-social-profileheader--contract',
    },
  },
}
