'use client'
import React from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from './ui/button'
const LoginButton = () => {
  const { pending } = useFormStatus()

  return (
    <Button disabled={pending} type='submit'>
      Submit
    </Button>
    // <button
    //   disabled={pending}
    //   type='submit'
    //   className=' text-white bg-[#2093ff] p-3 mx-6 max-w-fit disabled:bg-gray-400'
    // >
    //   {pending ? 'Loggin In...' : 'Log In'}
    // </button>
  )
}

export default LoginButton
