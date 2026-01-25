const WHATSAPP_API_URL = 'https://graph.facebook.com/v18.0';
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

// Send a text message
export async function sendTextMessage(to: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'text',
          text: {
            preview_url: false,
            body: message,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp API Error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp message:', error);
    return false;
  }
}

// Send interactive list message (for main menu)
export async function sendListMessage(
  to: string,
  headerText: string,
  bodyText: string,
  buttonText: string,
  sections: Array<{
    title: string;
    rows: Array<{ id: string; title: string; description?: string }>;
  }>
): Promise<boolean> {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'list',
            header: {
              type: 'text',
              text: headerText,
            },
            body: {
              text: bodyText,
            },
            action: {
              button: buttonText,
              sections: sections,
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp List API Error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp list message:', error);
    return false;
  }
}

// Send interactive button message (for confirmations)
export async function sendButtonMessage(
  to: string,
  bodyText: string,
  buttons: Array<{ id: string; title: string }>
): Promise<boolean> {
  try {
    const response = await fetch(
      `${WHATSAPP_API_URL}/${PHONE_NUMBER_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: to,
          type: 'interactive',
          interactive: {
            type: 'button',
            body: {
              text: bodyText,
            },
            action: {
              buttons: buttons.map((btn) => ({
                type: 'reply',
                reply: {
                  id: btn.id,
                  title: btn.title,
                },
              })),
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error('WhatsApp Button API Error:', error);
      return false;
    }
    return true;
  } catch (error) {
    console.error('Failed to send WhatsApp button message:', error);
    return false;
  }
}

// Extract message data from webhook payload
export interface MessageData {
  from: string;
  type: 'text' | 'interactive' | 'button';
  text?: string;
  buttonId?: string;
  listId?: string;
}

export function extractMessageData(body: any): MessageData | null {
  try {
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      return null;
    }

    const message = messages[0];
    const from = message.from;

    // Text message
    if (message.type === 'text') {
      return {
        from,
        type: 'text',
        text: message.text.body,
      };
    }

    // Interactive message (list selection or button)
    if (message.type === 'interactive') {
      const interactive = message.interactive;
      
      // List reply
      if (interactive.type === 'list_reply') {
        return {
          from,
          type: 'interactive',
          listId: interactive.list_reply.id,
        };
      }
      
      // Button reply
      if (interactive.type === 'button_reply') {
        return {
          from,
          type: 'button',
          buttonId: interactive.button_reply.id,
        };
      }
    }

    return null;
  } catch (error) {
    console.error('Failed to extract message data:', error);
    return null;
  }
}
