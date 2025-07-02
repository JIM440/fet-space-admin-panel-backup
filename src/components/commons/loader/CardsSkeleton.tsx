import React from 'react'
import ContentContainer from '../containers/ContentContainer'

const CardsSkeleton = () => {
  return (
          <ContentContainer>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </ContentContainer>
  )
}


// Reusable CardSkeleton component with fade animation
const CardSkeleton: React.FC = () => (
  <div className="p-4 border-1 border-neutral-border mb-4 animate-pulse bg-background-neutral">
    <div className="h-6 w-3/4 mb-2"></div>
    <div className="h-4 w-full mb-2"></div>
    <div className="h-4 w-1/2"></div>
  </div>
);

export default CardsSkeleton
