import { Resend } from 'resend'

// Server-side Resend client — never import in Client Components.
export const resend = new Resend(process.env.RESEND_API_KEY!)

// FROM address — update to verified domain once DNS is set up in Resend.
// Until then, use Resend's shared testing domain or your verified domain.
export const EMAIL_FROM = 'StayRight <hello@stayright.co.uk>'
