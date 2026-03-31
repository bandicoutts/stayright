import type { Metadata } from 'next'
import { LoginForm } from './LoginForm'

export const metadata: Metadata = {
  title: 'Sign in',
}

interface Props {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const params = await searchParams
  return <LoginForm initialError={params.error} defaultTab="login" />
}
