// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-27
// source=packages/ui/src/tabs/tabs.tsx
// component=Tabs
import figma from 'figma'

export default {
  example: figma.code`
    <Tabs value={tab} onValueChange={setTab} items={items} />
  `,
  imports: ['import { Tabs } from "@unpopping-candy/ui/tabs"'],
  id: 'ui-tabs',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'ui.tabs',
      storyId: 'catalog-ui-tabs--contract',
    },
  },
}
