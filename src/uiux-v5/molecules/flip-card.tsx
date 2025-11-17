import { ReactNode } from 'react'

export const FlipCard = ({ front, back }: { front: ReactNode; back: ReactNode }) => (
  <div className="group perspective-1000 h-48">
    <div className="relative h-full w-full transition-transform duration-500 transform-style-3d group-hover:rotate-y-180">
      <div className="absolute inset-0 rounded-lg border bg-white dark:bg-gray-800 p-6 flex items-center justify-center backface-hidden">
        {front}
      </div>
      <div className="absolute inset-0 rounded-lg border bg-blue-600 text-white p-6 flex items-center justify-center backface-hidden rotate-y-180">
        {back}
      </div>
    </div>
  </div>
)
