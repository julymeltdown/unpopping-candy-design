// url=https://www.figma.com/design/COMMONSPACE_LIBRARY/Commonspace-UI?node-id=0-16
// source=packages/ui/src/container/container.tsx
// component=Container
import figma from 'figma'

export default {
  example: figma.code`
    <Container size="lg"><main>{children}</main></Container>
  `,
  imports: ['import { Container } from "@commonspace/ui/layout"'],
  id: 'ui-container',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.container',
      storyId: 'catalog-ui-container--contract',
    },
  },
}
