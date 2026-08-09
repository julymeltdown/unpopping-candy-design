// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-2
// source=packages/social/src/notification/notification-item.tsx
// component=NotificationItem
import figma from 'figma'

export default {
  example: figma.code`
    <NotificationItem notification={item} onSelect={openTarget} />
  `,
  imports: ['import { NotificationItem } from "@commonspace/social/notification"'],
  id: 'social-notification-item',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.notification-item',
      storyId: 'catalog-social-notification-item--contract',
    },
  },
}
