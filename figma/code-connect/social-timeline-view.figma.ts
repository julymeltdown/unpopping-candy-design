// url=https://www.figma.com/design/POPCANDY_LIBRARY/Unpopping-Candy?node-id=0-10
// source=packages/social/src/timeline/timeline-view.tsx
// component=TimelineView
import figma from 'figma'

export default {
  example: figma.code`
    <TimelineView posts={posts} renderPost={renderPost} loadingMore={isFetchingNextPage} />
  `,
  imports: ['import { TimelineView } from "@unpopping-candy/social/timeline"'],
  id: 'social-timeline-view',
  metadata: {
    nestable: true,
    props: {
      knowledgeId: 'social.timeline-view',
      storyId: 'catalog-social-timelineview--contract',
    },
  },
}
