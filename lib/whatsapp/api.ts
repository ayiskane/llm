const WHATSAPP_API_URL = 'https://graph.facebook.com/v24.0';

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

type FlowOptions = {
  flowToken?: string;
  screen?: string;
  data?: Record<string, unknown>;
  action?: 'navigate' | 'data_exchange';
};

const sendFlowMessageInternal = async (
  phoneNumberId: string,
  to: string,
  headerText: string,
  bodyText: string,
  buttonText: string,
  flowId: string,
  options?: FlowOptions
): Promise<{ ok: boolean; error?: string }> => {
  const token = process.env.WHATSAPP_ACCESS_TOKEN;
  if (!token) return { ok: false, error: 'WHATSAPP_ACCESS_TOKEN not set' };

  try {
    const parameters: Record<string, unknown> = {
      flow_message_version: '3',
      flow_id: flowId,
      flow_cta: buttonText,
      flow_token: options?.flowToken,
      flow_action: options?.action || 'data_exchange',
    };
    if (options?.screen || options?.data) {
      parameters.flow_action_payload = {
        screen: options?.screen,
        data: options?.data || {},
      };
    }

    const res = await fetch(`${WHATSAPP_API_URL}/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'interactive',
        interactive: {
          type: 'flow',
          header: { type: 'text', text: headerText },
          body: { text: bodyText },
          action: {
            name: 'flow',
            parameters,
          },
        },
      }),
    });
    if (!res.ok) {
      let message = 'Unknown error';
      try {
        const payload = await res.json();
        message = payload?.error?.message || payload?.message || message;
        console.error('WhatsApp Flow Error:', payload);
      } catch (e) {
        console.error('WhatsApp Flow Error (parse):', e);
      }
      return { ok: false, error: message };
    }
    return { ok: true };
  } catch (e) {
    console.error('sendFlowMessage error:', e);
    return { ok: false, error: 'Network error while sending flow' };
  }
};

export async function sendFlowMessage(
  phoneNumberId: string,
  to: string,
  headerText: string,
  bodyText: string,
  buttonText: string,
  flowId: string,
  options?: FlowOptions
): Promise<boolean> {
  const result = await sendFlowMessageInternal(
    phoneNumberId,
    to,
    headerText,
    bodyText,
    buttonText,
    flowId,
    options
  );
  return result.ok;
}

export async function sendFlowMessageWithError(
  phoneNumberId: string,
  to: string,
  headerText: string,
  bodyText: string,
  buttonText: string,
  flowId: string,
  options?: FlowOptions
): Promise<{ ok: boolean; error?: string }> {
  return sendFlowMessageInternal(
    phoneNumberId,
    to,
    headerText,
    bodyText,
    buttonText,
    flowId,
    options
  );
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
  flow?: {
    id?: string;
    token?: string;
    screen?: string;
    data?: Record<string, unknown>;
  };
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
      if (i.type === 'flow_reply' && i.flow_reply) {
        const raw = i.flow_reply;
        let data: Record<string, unknown> | undefined = undefined;
        if (raw.data) {
          if (typeof raw.data === 'string') {
            try { data = JSON.parse(raw.data); } catch { data = { value: raw.data }; }
          } else if (typeof raw.data === 'object') {
            data = raw.data;
          }
        }
        return {
          from,
          phoneNumberId,
          type: 'interactive',
          content: 'flow_reply',
          flow: { id: raw.flow_id, token: raw.flow_token, screen: raw.screen, data },
        };
      }
      if (i.type === 'nfm_reply' && i.nfm_reply) {
        const raw = i.nfm_reply;
        let data: Record<string, unknown> | undefined = undefined;
        if (raw.response_json) {
          try { data = JSON.parse(raw.response_json); } catch { data = { value: raw.response_json }; }
        }
        return {
          from,
          phoneNumberId,
          type: 'interactive',
          content: 'flow_reply',
          flow: { id: raw.flow_id, token: raw.flow_token, screen: raw.screen, data },
        };
      }
      const content = i.type === 'list_reply' ? i.list_reply.id : i.type === 'button_reply' ? i.button_reply.id : null;
      if (content) return { from, phoneNumberId, type: 'interactive', content };
    }
    return null;
  } catch (e) { console.error('extractMessageData error:', e); return null; }
}
