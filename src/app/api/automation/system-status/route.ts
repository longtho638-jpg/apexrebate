import { NextRequest, NextResponse } from 'next/server';
import { stepByStepAutomation } from '@/lib/automation/step-by-step-automation';

export async function GET(request: NextRequest) {
  try {
    const systemStatus = await stepByStepAutomation.getSystemStatus();
    
    return NextResponse.json({
      success: true,
      data: systemStatus
    });
  } catch (error) {
    console.error('Failed to get system status:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}