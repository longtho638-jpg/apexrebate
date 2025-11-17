'use client'

import { useEffect, useState } from 'react'

export const useScrollEffects = () => {
  const [offset, setOffset] = useState(0)

  useEffect(() => {
    const handler = () => {
      const progress = Math.min(window.scrollY / 600, 1)
      setOffset(progress * 40)
    }

    window.addEventListener('scroll', handler)
    handler()
    return () => window.removeEventListener('scroll', handler)
  }, [])

  return { offset }
}
