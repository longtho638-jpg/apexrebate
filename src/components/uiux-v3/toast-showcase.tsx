'use client'

import { Button, useToast } from '@/features/uiux-v3/components'

export function ToastShowcase() {
  const { toast } = useToast()
  // Hardcoded text thay vì useTranslations
  const title = 'Developer Guide'
  const description = 'Use this interactive canvas to validate, plan, and execute the UI/UX roadmap.'
  const action = 'Show Toast'

  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({
          title,
          description,
        })
      }
      data-i18n="toast.action"
    >
      {action}
    </Button>
  )
}
