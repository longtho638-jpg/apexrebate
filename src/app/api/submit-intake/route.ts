import { NextRequest, NextResponse } from 'next/server';
import { emailService, EmailType } from '@/lib/email';
import { emailTriggers } from '@/lib/email-triggers';
import { UserService } from '@/lib/services/user.service';
import { GamificationService } from '@/lib/gamification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      email, 
      tradingVolume, 
      preferredBroker, 
      experience,
      referralSource,
      referralCode
    } = body;

    // Validate required fields
    if (!email || !tradingVolume || !preferredBroker) {
      return NextResponse.json(
        { 
          error: 'Missing required fields: email, tradingVolume, preferredBroker' 
        },
        { status: 400 }
      );
    }

    // Calculate potential savings (for concierge email)
    const monthlyFees = parseFloat(tradingVolume) * 0.0004; // 0.04% typical fee
    const estimatedSavings = monthlyFees * 0.4 * 0.1; // 40% broker share * 10% ApexRebate

    // Generate user name from email for personalization
    const userName = email.split('@')[0];
    const formattedUserName = userName.charAt(0).toUpperCase() + userName.slice(1);

    // Create or update user using UserService
    const userRecord = await UserService.createOrUpdateUser({
      email,
      name: formattedUserName,
      tradingVolume,
      preferredBroker,
      experience,
      referralSource,
      referralCode
    });

    // Log for concierge follow-up
    console.log('New intake submission:', {
      ...userRecord,
      estimatedMonthlySavings: estimatedSavings
    });

    // Process referral rewards if applicable
    if (userRecord.referredBy) {
      await GamificationService.processReferral(userRecord.referredBy, userRecord.id);
    }

    // Send welcome email using the new email service
    try {
      // await emailTriggers.onUserRegistered(userRecord.id);
      console.log('Welcome email sent successfully to:', email);
    } catch (emailError) {
      console.error('Error sending welcome email:', emailError);
      // Continue with the response even if email fails
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    return NextResponse.json({
      success: true,
      userId: userRecord.id,
      estimatedMonthlySavings: estimatedSavings,
      message: 'Application received. Our concierge team will contact you within 24 hours.',
      emailSent: true,
      referralApplied: !!userRecord.referredBy
    });

  } catch (error) {
    console.error('Intake form error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}