import { Hono } from 'hono'
import { supabase } from '../lib/supabase'
import type { Variables } from '../index'

const MICROSOFT_CLIENT_ID = '00000000402b5328'

// device_code en mémoire : sessionId → { deviceCode, expiresAt }
const sessions = new Map<string, { deviceCode: string; expiresAt: number }>()

const auth = new Hono<{ Variables: Variables }>()

auth.post('/microsoft/device-code', async (c) => {
  const res = await fetch('https://login.live.com/oauth20_connect.srf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      scope: 'XboxLive.signin offline_access',
      response_type: 'device_code',
    }),
  })

  if (!res.ok) return c.json({ error: 'Failed to get device code' }, 500)

  const data = await res.json() as {
    device_code: string
    user_code: string
    verification_uri: string
    expires_in: number
    interval: number
  }

  const sessionId = crypto.randomUUID()
  sessions.set(sessionId, {
    deviceCode: data.device_code,
    expiresAt: Date.now() + data.expires_in * 1000,
  })

  return c.json({
    sessionId,
    userCode: data.user_code,
    verificationUri: data.verification_uri,
    expiresIn: data.expires_in,
    interval: data.interval,
  })
})

auth.get('/microsoft/poll/:sessionId', async (c) => {
  const session = sessions.get(c.req.param('sessionId'))
  if (!session) return c.json({ error: 'Session not found' }, 404)
  if (Date.now() > session.expiresAt) {
    sessions.delete(c.req.param('sessionId'))
    return c.json({ error: 'Session expired' }, 410)
  }

  // Poll Microsoft
  const tokenRes = await fetch('https://login.live.com/oauth20_token.srf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: MICROSOFT_CLIENT_ID,
      grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
      device_code: session.deviceCode,
    }),
  })

  const tokenData = await tokenRes.json() as Record<string, string>

  if (tokenData.error === 'authorization_pending' || tokenData.error === 'slow_down') {
    return c.json({ status: 'pending' })
  }

  if (tokenData.error) {
    sessions.delete(c.req.param('sessionId'))
    return c.json({ error: tokenData.error }, 400)
  }

  sessions.delete(c.req.param('sessionId'))
  const msToken = tokenData.access_token

  // Xbox Live
  const xblRes = await fetch('https://user.auth.xboxlive.com/user/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      Properties: {
        AuthMethod: 'RPS',
        SiteName: 'user.auth.xboxlive.com',
        RpsTicket: `d=${msToken}`,
      },
      RelyingParty: 'http://auth.xboxlive.com',
      TokenType: 'JWT',
    }),
  })

  if (!xblRes.ok) return c.json({ error: 'Xbox Live authentication failed' }, 401)
  const xbl = await xblRes.json() as { Token: string; DisplayClaims: { xui: { uhs: string }[] } }

  // XSTS
  const xstsRes = await fetch('https://xsts.auth.xboxlive.com/xsts/authorize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      Properties: { SandboxId: 'RETAIL', UserTokens: [xbl.Token] },
      RelyingParty: 'rp://api.minecraftservices.com/',
      TokenType: 'JWT',
    }),
  })

  if (!xstsRes.ok) return c.json({ error: 'XSTS authentication failed' }, 401)
  const xsts = await xstsRes.json() as { Token: string }

  // Minecraft token
  const mcAuthRes = await fetch('https://api.minecraftservices.com/authentication/login_with_xbox', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identityToken: `XBL3.0 x=${xbl.DisplayClaims.xui[0].uhs};${xsts.Token}`,
    }),
  })

  if (!mcAuthRes.ok) return c.json({ error: 'Minecraft authentication failed' }, 401)
  const { access_token: mcToken } = await mcAuthRes.json() as { access_token: string }

  // Minecraft profile
  const profileRes = await fetch('https://api.minecraftservices.com/minecraft/profile', {
    headers: { Authorization: `Bearer ${mcToken}` },
  })

  if (!profileRes.ok) return c.json({ error: 'No Minecraft account linked to this Microsoft account' }, 404)

  const profile = await profileRes.json() as {
    id: string
    name: string
    skins: { state: string; url: string }[]
  }

  const minecraft = {
    uuid: profile.id,
    username: profile.name,
    skinUrl: profile.skins?.find(s => s.state === 'ACTIVE')?.url ?? null,
  }

  const email = `mc_${profile.id}@konoharku.local`

  // Crée le user Supabase si inexistant (ignore l'erreur si déjà existant)
  await supabase.auth.admin.createUser({
    email,
    email_confirm: true,
    user_metadata: { minecraft },
  })

  // Génère un token de connexion one-time
  const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
    type: 'magiclink',
    email,
    options: { data: { minecraft } },
  })

  if (linkError || !linkData) return c.json({ error: 'Failed to create session' }, 500)

  return c.json({
    status: 'success',
    tokenHash: linkData.properties.hashed_token,
    email,
  })
})

export default auth
