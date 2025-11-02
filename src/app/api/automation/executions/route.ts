import { NextRequest, NextResponse } from 'next/server';
import { stepByStepAutomation } from '@/lib/automation/step-by-step-automation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get('workflowId');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const executions = await stepByStepAutomation.getExecutionHistory(workflowId || undefined, limit);
    
    return NextResponse.json({
      success: true,
      data: executions
    });
  } catch (error) {
    console.error('Failed to get executions:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}