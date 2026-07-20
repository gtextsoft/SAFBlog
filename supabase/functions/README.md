# Edge Functions

## `unsubscribe`

Removes an address from `newsletter_subscribers`. Runs under the service-role
key because RLS grants write access on that table to admins only, and a
newsletter recipient has no account.

### Why a signed token

Authorisation cannot come from a session here. Instead each emailed unsubscribe
link carries an HMAC-SHA256 token binding it to one address — holding a valid
token proves the bearer received mail at that address.

The tokens do not expire. An unsubscribe link has to keep working for the life
of the email that carried it; expiry would break opt-out for anyone reading an
old newsletter, which is the exact failure CAN-SPAM and GDPR penalise.

Every response is identical whether the address was subscribed, already
unsubscribed, or absent. Distinguishing them would make the endpoint a
subscriber-enumeration oracle.

### Deploy

Upload the whole `unsubscribe/` folder (`index.ts`, `cors.ts`, `token.ts`).
Dashboard and CLI both require those siblings — relative imports outside the
function directory are not included in the bundle.

```bash
# One-time: set the signing secret. Generate a strong random value and keep it
# stable — rotating it invalidates every unsubscribe link already in inboxes.
openssl rand -base64 32
supabase secrets set NEWSLETTER_TOKEN_SECRET='<the generated value>'

# Optional: restrict CORS. Defaults to the production domain plus localhost.
supabase secrets set ALLOWED_ORIGINS='https://blog.stephenakintayofoundation.org'

supabase functions deploy unsubscribe
```

`SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are injected by the platform —
do not set them yourself, and never expose the service-role key to the browser.

### Building links when sending a newsletter

Mint one token per recipient with `signToken` from `unsubscribe/token.ts`:

```ts
import { signToken } from "./token.ts";

const token = await signToken(subscriber.email, Deno.env.get("NEWSLETTER_TOKEN_SECRET")!);
const link = `https://blog.stephenakintayofoundation.org/unsubscribe` +
  `?token=${encodeURIComponent(token)}&email=${encodeURIComponent(subscriber.email)}`;
```

The `email` parameter is cosmetic — it lets the page show which address is
being removed. It is never trusted; the token is the sole authority.

Set both headers on outgoing mail so Gmail and Outlook render their native
unsubscribe control (RFC 8058 one-click):

```
List-Unsubscribe: <https://<project-ref>.supabase.co/functions/v1/unsubscribe?token=...>, <mailto:info@stephenakintayofoundation.org?subject=unsubscribe>
List-Unsubscribe-Post: List-Unsubscribe=One-Click
```

The function accepts the token from the query string for one-click clients and
from a JSON body for the unsubscribe page.

### Verifying the token implementation

`unsubscribe/token.ts` uses only standard Web Crypto, so its logic can be exercised
under Node without a Deno toolchain:

```bash
node --experimental-strip-types scripts/token.test.mjs
```

Covers round-tripping, address normalisation, and rejection of wrong secrets,
swapped addresses, altered signatures, and malformed input.
