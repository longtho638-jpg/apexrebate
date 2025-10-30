import { NextRequest, NextResponse } from 'next/server';
import { stepByStepAutomation } from '@/lib/automation/step-by-step-automation';

export async function GET(request: NextRequest) {
  try {
    const workflows = stepByStepAutomation.getWorkflows();
    
    return NextResponse.json({
      success: true,
      data: workflows
    });
  } catch (error) {
    console.error('Failed to get workflows:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const workflowData = await request.json();
    
    const workflowId = await stepByStepAutomation.registerWorkflow(workflowData);
    
    return NextResponse.json({
      success: true,
      data: { workflowId }
    });
  } catch (error) {
    console.error('Failed to register workflow:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}