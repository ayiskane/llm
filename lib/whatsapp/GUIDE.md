# WhatsApp Flows — Complete Setup Guide (Vercel)

## Your Credentials

| Key | Value |
|-----|-------|
| WABA ID | `YOUR_WABA_ID` |
| Graph API Version | `v24.0` |
| Access Token | `YOUR_ACCESS_TOKEN` (see .env.example) |

> ⚠️ **Keep your access token secret.** Never commit it to git or share it publicly.

---

## Project Structure (Vercel Serverless)

```
your-project/
├── api/
│   └── whatsapp/
│       ├── flow.js           ← POST /api/whatsapp/flow   (encrypted data_exchange)
│       └── webhook.js        ← GET + POST /api/whatsapp/webhook
├── lib/
│   ├── encryption.js         ← RSA + AES decrypt/encrypt
│   ├── flow-handler.js       ← Screen routing logic
│   ├── whatsapp-api.js       ← sendFlowMessage, sendTextMessage, etc.
│   └── db.js                 ← Postgres queries (serverless-safe pool)
├── registration-flow.json    ← Flow JSON for llm_registration
├── verification-flow.json    ← Flow JSON for llm_verification
├── schema.sql                ← Database tables
├── package.json
├── vercel.json
└── .env.example
```

Vercel automatically maps `api/whatsapp/flow.js` → `POST https://yourdomain.vercel.app/api/whatsapp/flow`. No Express needed.

---

## Using the Graph API Explorer (Instead of curl)

For most steps you can use the **Graph API Explorer** instead of curl:

1. Go to https://developers.facebook.com/tools/explorer/
2. Paste your access token in the **Access Token** field at the top
3. Set the HTTP method (GET / POST) from the dropdown
4. Enter just the path (e.g. `2101935523953125/flows`) — the base URL is added automatically
5. For POST requests with JSON body, click **"Add a Field"** or use the body tab
6. Click **Submit**

> **Note:** The Graph API Explorer doesn't support file uploads (Step 6), so you'll need curl or Postman for uploading Flow JSON assets.

---

## STEP 1: Generate RSA Key Pair

```bash
# Without passphrase (simpler for dev):
openssl genrsa -out private.pem 2048

# Export the public key
openssl rsa -in private.pem -outform PEM -pubout -out public.pem
```

Your `public.pem` should look like:
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAx9zvqt8065fLJuNLw2mN
fMxzJM5lDuE1kFRzg2FlgKvPIpQrpwf5faYQUeUeBk58OLQ2KwjRt97rkz2KBpna
HDMI5cz29teUNnxYjSapFxWm2MJvFqFdLayaEbdVEDRgqzmyyBxqQX8Gz+77Gmy6
iBdTykm8fZshN9hJBoEYRDIhCQ5tfF/k9uqHH2YxZ+s0tAVBBGnl8XVbTLTFBfH1
V9BofTjGrRwBojEWDByKx/DqsjR/GdU2GASLtGrqfbg1/Y4ifJ4yErAjCXLc46qb
fhfMiXZh41t3G9XSxfxRwLIcQWEP33KBWe6++y/tXFL8Aur1OfIBakdiShmKWIlt
wwIDAQAB
-----END PUBLIC KEY-----
```

Keep `private.pem` safe — it goes in Vercel environment variables.

---

## STEP 2: Upload Public Key to Meta

### Using Graph API Explorer:
1. Method: **POST**
2. Path: `2101935523953125/whatsapp_business_encryption`
3. Add parameter: `business_public_key` → paste the full content of your `public.pem` (including BEGIN/END lines)
4. Click **Submit**

### Using curl:
```bash
curl -X POST \
  "https://graph.facebook.com/v24.0/2101935523953125/whatsapp_business_encryption" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d "business_public_key=$(cat public.pem)"
```

### Verify:
**Graph API Explorer:** GET → `2101935523953125/whatsapp_business_encryption` → Submit

---

## STEP 3: Create the Two Flows

### 3a. Registration Flow

**Graph API Explorer:**
1. Method: **POST**
2. Path: `2101935523953125/flows`
3. Add fields: `name` = `llm_registration`, `categories` = `["OTHER"]`
4. Submit → **Save the returned ID**

### 3b. Verification Flow

Same path, but: `name` = `llm_verification`, `categories` = `["OTHER"]`

→ **Save the returned ID**

---

## STEP 4: Deploy to Vercel

### 4a. Push to Git

```bash
cd your-project
git init
git add .
git commit -m "Initial WhatsApp Flows setup"
git remote add origin https://github.com/you/your-repo.git
git push -u origin main
```

### 4b. Import in Vercel

1. Go to https://vercel.com/new
2. Import your Git repo
3. Framework Preset: **Other**
4. Click **Deploy**

### 4c. Set Environment Variables

Go to your project in Vercel → **Settings** → **Environment Variables** and add:

| Variable | Value |
|----------|-------|
| `WHATSAPP_FLOW_PRIVATE_KEY` | Full PEM content of `private.pem` (use `\n` for newlines) |
| `WHATSAPP_FLOW_PASSPHRASE` | Empty (unless you set one) |
| `WHATSAPP_REGISTRATION_FLOW_ID` | ID from Step 3a |
| `WHATSAPP_VERIFICATION_FLOW_ID` | ID from Step 3b |
| `WHATSAPP_ACCESS_TOKEN` | Your full access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Your phone number ID |
| `WEBHOOK_VERIFY_TOKEN` | Any string you choose (e.g. `my_secret_verify_token`) |
| `DATABASE_URL` | Your Postgres connection string |

> **⚠️ Private Key Tip:** In Vercel's env var UI, paste the full PEM content. Replace actual newlines with `\n` so it's one line:
> `-----BEGIN RSA PRIVATE KEY-----\nMIIEow...\n-----END RSA PRIVATE KEY-----`

### 4d. Redeploy

After setting env vars, go to **Deployments** → click the latest → **Redeploy**.

Your endpoint is now live at: `https://your-project.vercel.app/api/whatsapp/flow`

---

## STEP 5: Set the Endpoint URI on Each Flow

Replace `{REGISTRATION_FLOW_ID}` and `{VERIFICATION_FLOW_ID}` with your saved IDs. Replace `your-project.vercel.app` with your actual Vercel domain.

### Registration Flow

**Graph API Explorer:**
1. Method: **POST**
2. Path: `{REGISTRATION_FLOW_ID}`
3. Add fields: `endpoint_uri` = `https://your-project.vercel.app/api/whatsapp/flow`, `data_api_version` = `3.0`
4. Submit

### Verification Flow

Same but path = `{VERIFICATION_FLOW_ID}`, same body.

---

## STEP 6: Upload Flow JSON Assets

> ⚠️ **Requires curl or Postman** — Graph API Explorer doesn't support file uploads.

```bash
# Registration Flow
curl -X POST \
  "https://graph.facebook.com/v24.0/{REGISTRATION_FLOW_ID}/assets" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=flow.json" \
  -F "file=@registration-flow.json"

# Verification Flow
curl -X POST \
  "https://graph.facebook.com/v24.0/{VERIFICATION_FLOW_ID}/assets" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "name=flow.json" \
  -F "file=@verification-flow.json"
```

### Using Postman instead:
1. Method: **POST**
2. URL: `https://graph.facebook.com/v24.0/{FLOW_ID}/assets`
3. Auth → Bearer Token → paste access token
4. Body → **form-data**: `name` = `flow.json`, `file` = (File) select your JSON
5. Send

---

## STEP 7: Configure Webhook in Meta

1. Go to https://developers.facebook.com → Your App → **WhatsApp** → **Configuration**
2. Webhook URL: `https://your-project.vercel.app/api/whatsapp/webhook`
3. Verify token: the same string you set as `WEBHOOK_VERIFY_TOKEN` in Vercel
4. Click **Verify and Save**
5. Subscribe to: `messages`

---

## STEP 8: Test in Draft Mode

**Graph API Explorer:**
1. Method: **POST**
2. Path: `{PHONE_NUMBER_ID}/messages`
3. Body:
```json
{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "YOUR_PHONE_NUMBER",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "body": { "text": "Welcome to LLM! Register to get started." },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_message_version": "3",
        "flow_id": "{REGISTRATION_FLOW_ID}",
        "flow_cta": "Register",
        "mode": "draft",
        "flow_action": "data_exchange"
      }
    }
  }
}
```

---

## STEP 9: Publish Flows

**Graph API Explorer:** POST → `{REGISTRATION_FLOW_ID}/publish` → Submit (no body)

Then: POST → `{VERIFICATION_FLOW_ID}/publish` → Submit

> ⚠️ Published flows CANNOT be edited. Clone first if you need changes.

---

## Vercel-Specific Notes

### Cold Starts
WhatsApp sends `ping` health checks to your endpoint. If Vercel's cold start exceeds ~10 seconds, Meta may throttle your flow. The `vercel.json` sets `maxDuration: 30` to give enough headroom. On the Hobby plan, cold starts are usually 1-3 seconds — should be fine.

### Database
Vercel Postgres, Supabase, or Neon all work well. The `lib/db.js` pool is set to `max: 3` connections since serverless functions spin up many instances. If you're on Neon or Supabase, their connection poolers handle this automatically.

### Logs
Check function logs at: Vercel Dashboard → your project → **Logs** tab. All `console.log` / `console.error` from the flow handler will show up here.

### Custom Domain
If you have a custom domain on Vercel, use that as your endpoint URI instead of `*.vercel.app`. Looks more professional and won't change if you rename the project.

---

## Useful Graph API Explorer Queries

| What | Method | Path |
|------|--------|------|
| List all flows | GET | `2101935523953125/flows` |
| Flow details | GET | `{FLOW_ID}?fields=name,status,categories,endpoint_uri,validation_errors` |
| Check encryption key | GET | `2101935523953125/whatsapp_business_encryption` |
| Flow preview URL | GET | `{FLOW_ID}?fields=preview` |
| Delete draft flow | DELETE | `{FLOW_ID}` |

---

## How It All Connects

```
User sends message → POST /api/whatsapp/webhook
  ├─ Not registered → sendFlowMessage(registration_flow)
  ├─ Lawyer → showLawyerMenu()
  │    ├─ Pending verifications → sendFlowMessage(verification_flow, {prefilled data})
  │    ├─ Expiring staff → sendFlowMessage(verification_flow, {reverify data})
  │    └─ Account actions → sendButtonMessage()
  ├─ A/S → showASMenu()
  │    ├─ Status + Get PIN
  │    └─ Upgrade to Lawyer
  └─ Staff → showStaffMenu()
       └─ Status + Get PIN

User interacts with Flow screen → Meta encrypts → POST /api/whatsapp/flow
  → Decrypt → Route by screen → Validate → Encrypt response
  → Or close flow + side effects (create account, send PIN, etc.)
```

---

## File Overview

| File | Purpose |
|------|---------|
| `api/whatsapp/flow.js` | Serverless function: encrypted Flow endpoint |
| `api/whatsapp/webhook.js` | Serverless function: webhook (GET verify + POST messages) |
| `lib/encryption.js` | RSA + AES decrypt/encrypt |
| `lib/flow-handler.js` | All screen routing logic |
| `lib/whatsapp-api.js` | WhatsApp Cloud API helpers (native fetch) |
| `lib/db.js` | Postgres queries (serverless-safe pool) |
| `registration-flow.json` | Flow JSON for llm_registration |
| `verification-flow.json` | Flow JSON for llm_verification |
| `schema.sql` | Database tables |
| `vercel.json` | Function config (maxDuration) |
| `package.json` | Dependencies |
| `.env.example` | Environment variables reference |
