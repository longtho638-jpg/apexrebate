import { NextRequest, NextResponse } from 'next/server';
import { stepByStepAutomation } from '@/lib/automation/step-by-step-automation';

export async function POST(request: NextRequest) {
  try {
    const { workflowId, triggerData } = await request.json();
    
    if (!workflowId) {
      return NextResponse.json({
        success: false,
        error: 'Workflow ID is required'
      }, { status: 400 });
    }
    
    const executionId = await stepByStepAutomation.executeWorkflow(workflowId, triggerData);
    
    return NextResponse.json({
      success: true,
      data: { executionId }
    });
  } catch (error) {
    console.error('Failed to execute workflow:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}