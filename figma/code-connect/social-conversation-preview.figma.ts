// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-1
// source=packages/social/src/conversation/conversation-preview.tsx
// component=ConversationPreview
import figma from 'figma'

export default {
  example: figma.code`
    <ConversationPreview conversation={conversation} onSelect={openConversation} />
  `,
  imports: ['import { ConversationPreview } from "@commonspace/social/conversation"'],
  id: 'social-conversation-preview',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.conversation-preview',
      storyId: 'catalog-social-conversation-preview--contract',
    },
  },
}
