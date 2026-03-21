import { LoginTabs } from './LoginTabs'

export const metadata = {
  title: 'Log in or Sign up — StayRight',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>
}) {
  const { tab } = await searchParams
  return <LoginTabs defaultTab={tab === 'signup' ? 'signup' : 'login'} />
}
