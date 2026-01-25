import { NextRequest, NextResponse } from 'next/server';
import { extractMessageData, handleMessage } from '@/lib/whatsapp';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'llm_verify_token_2024';

// GET - Webhook verification (called by Meta when setting up webhook)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  console.log('Webhook verification request:', { mode, token, challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified successfully');
    return new NextResponse(challenge, { status: 200 });
  }

  console.log('Webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

// POST - Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log('Incoming webhook:', JSON.stringify(body, null, 2));

    // Extract message data
    const messageData = extractMessageData(body);

    if (messageData) {
      console.log(`Message from ${messageData.from}:`, messageData);

      // Handle the message
      await handleMessage(messageData);
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    // Still return 200 to prevent Meta from retrying
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
