import { trpc } from '@/utils/trpc'
import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'

export default function Home() {
  const { data, isLoading } = trpc.useQuery(['hello', { text: "David"}])

  if (isLoading) {
    return (
      <div>
        Loading...
      </div>
    )
  }

  if (data) {
    return (
      <div>
        {data.greeting}
      </div>
    )
  }

  return (
    <div className='text-red-500'>
      Hello World
    </div>
  )
}