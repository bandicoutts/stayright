import { redirect } from 'next/navigation'

// /signup redirects to the sign-up tab on the login page.
// All landing page CTAs link to /signup for clarity; this keeps the URL intuitive.
export default function SignupPage() {
  redirect('/login?tab=signup')
}
