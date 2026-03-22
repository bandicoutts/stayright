import { Resend } from 'resend'

// FROM address — requires stayright.app to be verified in Resend.
// Emails are dormant until RESEND_API_KEY is set.
export const EMAIL_FROM = 'StayRight <hello@stayright.app>'

// Lazy initialisation — avoids throwing at build/import time when
// RESEND_API_KEY is not set (e.g. during `next build` on Vercel before
// the env var is configured). All callers already wrap sends in try/catch.
let _client: Resend | null = null

export const resend = {
  emails: {
    send: async (params: Parameters<Resend['emails']['send']>[0]) => {
      if (!process.env.RESEND_API_KEY) {
        console.warn('[resend] RESEND_API_KEY not set — email not sent')
        return { data: null, error: new Error('RESEND_API_KEY not configured') }
      }
      if (!_client) _client = new Resend(process.env.RESEND_API_KEY)
      return _client.emails.send(params)
    },
  },
}
