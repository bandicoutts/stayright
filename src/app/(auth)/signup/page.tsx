import type { Metadata } from 'next'
import { LoginForm } from '../login/LoginForm'

export const metadata: Metadata = {
  title: 'Sign up',
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: Props) {
  const params = await searchParams
  return <LoginForm initialError={params.error} />
}
