import { NextRequest, NextResponse } from 'next/server';
import { extractMessageData, handleMessage } from '@/lib/whatsapp';

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'llm_verify_token_2024';

// GET - Webhook verification
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const mode = params.get('hub.mode');
  const token = params.get('hub.verify_token');
  const challenge = params.get('hub.challenge');

  console.log('Webhook verification:', { mode, token: token?.slice(0, 10) + '...', challenge });

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('✅ Webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  console.log('❌ Webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

// POST - Handle incoming messages
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('📩 Incoming webhook:', JSON.stringify(body, null, 2));

    const msg = extractMessageData(body);
    if (msg) {
      console.log(`Message from ${msg.from}:`, msg.content);
      await handleMessage(msg);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ status: 'error' }, { status: 200 });
  }
}
