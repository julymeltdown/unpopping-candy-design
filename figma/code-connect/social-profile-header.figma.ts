// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-9
// source=packages/social/src/profile/profile-header.tsx
// component=ProfileHeader
import figma from 'figma'

export default {
  example: figma.code`
    <ProfileHeader profile={profile} action={<FollowButton />} />
  `,
  imports: ['import { ProfileHeader } from "@commonspace/social/profile"'],
  id: 'social-profile-header',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.profile-header',
      storyId: 'catalog-social-profile-header--contract',
    },
  },
}
