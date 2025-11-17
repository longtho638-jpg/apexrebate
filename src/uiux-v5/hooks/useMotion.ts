import { useMemo } from 'react'
import { motion as motionTokens } from '@/uiux-v5/tokens'

export const useEntranceMotion = () => {
  return useMemo(
    () => ({
      initial: { opacity: 0, y: motionTokens.entrance.distance },
      animate: { opacity: 1, y: 0 },
      transition: { duration: motionTokens.entrance.duration },
    }),
    []
  )
}
