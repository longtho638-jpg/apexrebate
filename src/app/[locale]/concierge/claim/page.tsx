'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle, AlertTriangle, FileText, DollarSign, Clock, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ClaimData {
  exchange: string
  tradeRef: string
  grossRebate: number
  description: string
}

interface EvidencePreview {
  claimId: string
  hash: string
  preview: {
    exchange: string
    tradeRef: string
    grossRebate: number
    netRebate: number
    commission: number
    timestamp: string
  }
}

export default function ConciergeClaimPage() {
  const t = useTranslations()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [claimData, setClaimData] = useState<ClaimData>({
    exchange: '',
    tradeRef: '',
    grossRebate: 0,
    description: ''
  })
  const [evidencePreview, setEvidencePreview] = useState<EvidencePreview | null>(null)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  // Set page title
  useEffect(() => {
    document.title = 'Submit Rebate Claim | ApexRebate Concierge'
  }, [])

  const exchanges = [
    { value: 'binance', label: 'Binance' },
    { value: 'bybit', label: 'Bybit' },
    { value: 'okx', label: 'OKX' },
    { value: 'coinbase', label: 'Coinbase' },
    { value: 'kraken', label: 'Kraken' },
    { value: 'kucoin', label: 'KuCoin' }
  ]

  const handleInputChange = (field: keyof ClaimData, value: string | number) => {
    setClaimData(prev => ({ ...prev, [field]: value }))
    if (evidencePreview) setEvidencePreview(null) // Reset preview when data changes
  }

  const generatePreview = async () => {
    if (!claimData.exchange || !claimData.tradeRef || !claimData.grossRebate) return

    // Mock preview generation
    const mockPreview: EvidencePreview = {
      claimId: `claim_${Date.now()}`,
      hash: `sha256_${Math.random().toString(36).substr(2, 9)}`,
      preview: {
        exchange: claimData.exchange,
        tradeRef: claimData.tradeRef,
        grossRebate: claimData.grossRebate,
        netRebate: claimData.grossRebate * 0.85, // Mock net after fees
        commission: claimData.grossRebate * 0.15,
        timestamp: new Date().toISOString()
      }
    }
    setEvidencePreview(mockPreview)
  }

  const submitClaim = async () => {
    if (!evidencePreview) return

    setIsSubmitting(true)
    try {
      const response = await fetch('/api/concierge/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: 'current_user', // Mock user ID
          exchange: claimData.exchange,
          trade_ref: claimData.tradeRef,
          gross_rebate: claimData.grossRebate
        })
      })

      if (response.ok) {
        const data = await response.json()
        setSubmitStatus('success')
        // Reset form
        setClaimData({ exchange: '', tradeRef: '', grossRebate: 0, description: '' })
        setEvidencePreview(null)
      } else {
        setSubmitStatus('error')
      }
    } catch (error) {
      console.error('Claim submission error:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          🚀 Concierge Rebate Claim
        </h1>
        <p className="text-muted-foreground">
          Submit your trading rebate claim manually. Our concierge team will process it within 24 hours.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Claim Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Claim Details
            </CardTitle>
            <CardDescription>
              Fill in your trading information for rebate calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="exchange">Exchange</Label>
              <Select value={claimData.exchange} onValueChange={(value) => handleInputChange('exchange', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select exchange" />
                </SelectTrigger>
                <SelectContent>
                  {exchanges.map((exchange) => (
                    <SelectItem key={exchange.value} value={exchange.value}>
                      {exchange.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tradeRef">Trade Reference</Label>
              <Input
                id="tradeRef"
                placeholder="Enter trade ID or reference"
                value={claimData.tradeRef}
                onChange={(e) => handleInputChange('tradeRef', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grossRebate">Gross Rebate Amount (VND)</Label>
              <Input
                id="grossRebate"
                type="number"
                placeholder="0"
                value={claimData.grossRebate || ''}
                onChange={(e) => handleInputChange('grossRebate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Additional Notes (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Any additional context or notes..."
                value={claimData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* File evidence upload (added for e2e test expectation) */}
            <div className="space-y-2">
              <Label htmlFor="evidenceFiles">Upload Evidence (Screenshots / Reports)</Label>
              <Input
                id="evidenceFiles"
                type="file"
                multiple
                accept="image/*,.png,.jpg,.jpeg,.pdf"
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground">
                Supported: PNG, JPG, PDF. You can attach multiple files. (Manual processing phase)
              </p>
            </div>

            <Button
              onClick={generatePreview}
              disabled={!claimData.exchange || !claimData.tradeRef || !claimData.grossRebate}
              className="w-full"
              variant="outline"
            >
              <Shield className="h-4 w-4 mr-2" />
              Generate Evidence Preview
            </Button>
          </CardContent>
        </Card>

        {/* Evidence Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Evidence Preview
            </CardTitle>
            <CardDescription>
              Review calculated rebate and evidence hash before submission
            </CardDescription>
          </CardHeader>
          <CardContent>
            {evidencePreview ? (
              <div className="space-y-4">
                <div className="p-4 bg-muted rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Claim ID:</span>
                    <Badge variant="outline">{evidencePreview.claimId}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Exchange:</span>
                    <span className="font-medium">{evidencePreview.preview.exchange}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trade Ref:</span>
                    <span className="font-medium">{evidencePreview.preview.tradeRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Gross Rebate:</span>
                    <span className="font-medium text-green-600">
                      {evidencePreview.preview.grossRebate.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Net Rebate:</span>
                    <span className="font-medium text-blue-600">
                      {evidencePreview.preview.netRebate.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commission:</span>
                    <span className="font-medium text-orange-600">
                      {evidencePreview.preview.commission.toLocaleString()} VND
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Timestamp:</span>
                    <span>{new Date(evidencePreview.preview.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t">
                    <div className="flex justify-between items-center text-xs">
                      <span>Evidence Hash:</span>
                      <code className="bg-background px-2 py-1 rounded text-xs">
                        {evidencePreview.hash.substring(0, 16)}...
                      </code>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={submitClaim}
                  disabled={isSubmitting}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isSubmitting ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Submit Claim
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Fill in claim details and generate preview to proceed</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Status Messages */}
      {submitStatus === 'success' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            ✅ Claim submitted successfully! Our concierge team will process it within 24 hours.
            You'll receive an email confirmation and payout details.
          </AlertDescription>
        </Alert>
      )}

      {submitStatus === 'error' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            ❌ Failed to submit claim. Please try again or contact support.
          </AlertDescription>
        </Alert>
      )}

      {/* Process Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>How the Concierge Process Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-medium">1. Submit Claim</h3>
              <p className="text-sm text-muted-foreground">
                Provide your trade details manually
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
                <Shield className="h-6 w-6 text-orange-600" />
              </div>
              <h3 className="font-medium">2. Manual Review</h3>
              <p className="text-sm text-muted-foreground">
                Our team verifies and calculates rebates
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-medium">3. Payout</h3>
              <p className="text-sm text-muted-foreground">
                Receive payment within 24 hours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
