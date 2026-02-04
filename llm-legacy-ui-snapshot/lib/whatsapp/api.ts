const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';

export async function sendTextMessage(phoneNumberId: string, to: string, message: string): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) { console.error('WHATSAPP_ACCESS_TOKEN not set'); return false; }

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { preview_url: false, body: message },
      }),
    });
    if (!res.ok) { console.error('WhatsApp API Error:', await res.json()); return false; }
    return true;
  } catch (e) { console.error('sendTextMessage error:', e); return false; }
}

export async function sendListMessage(
  phoneNumberId: string, to: string, headerText: string, bodyText: string,
  buttonText: string, sections: Array<{ title: string; rows: Array<{ id: string; title: string; description?: string }> }>
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) return false;

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'list',
          header: { type: 'text', text: headerText },
          body: { text: bodyText },
          action: { button: buttonText, sections },
        },
      }),
    });
    if (!res.ok) { console.error('WhatsApp List Error:', await res.json()); return false; }
    return true;
  } catch (e) { console.error('sendListMessage error:', e); return false; }
}

export async function sendButtonMessage(
  phoneNumberId: string, to: string, headerText: string, bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<boolean> {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) return false;

  try {
    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'button',
          header: { type: 'text', text: headerText },
          body: { text: bodyText },
          action: { buttons: buttons.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title } })) },
        },
      }),
    });
    if (!res.ok) { console.error('WhatsApp Button Error:', await res.json()); return false; }
    return true;
  } catch (e) { console.error('sendButtonMessage error:', e); return false; }
}

export interface MessageData {
  from: string;
  phoneNumberId: string;
  type: 'text' | 'interactive';
  content: string;
}

export function extractMessageData(body: any): MessageData | null {
  try {
    const value = body.entry?.[0]?.changes?.[0]?.value;
    const message = value?.messages?.[0];
    if (!message) return null;

    const from = message.from;
    const phoneNumberId = value.metadata?.phone_number_id;

    if (message.type === 'text') {
      return { from, phoneNumberId, type: 'text', content: message.text.body };
    }
    if (message.type === 'interactive') {
      const i = message.interactive;
      const content = i.type === 'list_reply' ? i.list_reply.id : i.type === 'button_reply' ? i.button_reply.id : null;
      if (content) return { from, phoneNumberId, type: 'interactive', content };
    }
    return null;
  } catch (e) { console.error('extractMessageData error:', e); return null; }
}
