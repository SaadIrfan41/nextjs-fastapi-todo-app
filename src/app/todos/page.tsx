import Todos from '@/components/Todo'
import React from 'react'
import { cookies } from 'next/headers'

async function getData() {
  const res = await fetch(`${process.env.BACKEND_URL}/api/todos/user`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${cookies().get('access_token')?.value}`,
    },
  })
  // The return value is *not* serialized
  // You can return Date, Map, Set, etc.

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    // throw new Error('Failed to fetch data')
    return 'Failed to fetch data'
  }

  return res.json()
}

const page = async () => {
  const data = await getData()
  console.log(data)
  return (
    <div>
      <Todos data={data} />
    </div>
  )
}

export default page
