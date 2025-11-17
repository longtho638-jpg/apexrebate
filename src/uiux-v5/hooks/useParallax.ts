'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

interface UseParallaxOptions {
  offset?: number
}

export const useParallax = ({ offset = 30 }: UseParallaxOptions) => {
  const [style, setStyle] = useState<CSSProperties>({})

  useEffect(() => {
    const handleMove = (event: MouseEvent) => {
      const { innerWidth, innerHeight } = window
      const x = (event.clientX / innerWidth - 0.5) * offset
      const y = (event.clientY / innerHeight - 0.5) * offset
      setStyle({ transform: `translate3d(${x}px, ${y}px, 0)` })
    }

    window.addEventListener('mousemove', handleMove)
    return () => window.removeEventListener('mousemove', handleMove)
  }, [offset])

  return { style }
}
