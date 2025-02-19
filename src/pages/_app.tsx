import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { Providers } from '@/components/providers'
import '../app/globals.css'

export default function App({ Component, pageProps }: AppProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <Providers>
      <Component {...pageProps} />
    </Providers>
  )
}
