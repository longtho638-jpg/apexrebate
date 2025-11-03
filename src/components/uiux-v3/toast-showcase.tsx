'use client'

import { useTranslations } from 'next-intl'

import { Button, useToast } from '@/features/uiux-v3/components'

export function ToastShowcase() {
  const { toast } = useToast()
  const t = useTranslations('uiuxV3.toast')

  return (
    <Button
      variant="secondary"
      onClick={() =>
        toast({
          title: t('title'),
          description: t('description'),
        })
      }
      data-i18n="toast.action"
    >
      {t('action')}
    </Button>
  )
}
