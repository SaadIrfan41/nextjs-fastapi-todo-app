import React, { useState } from 'react'
import { useAction } from 'next-safe-action/hooks'
import { createTodoAction } from '@/lib/actions'
import { toast } from 'sonner'
import { Button } from '../ui/button'
import { Input } from '../ui/input'

const CreateTodoButton = () => {
  const [name, setName] = useState('')

  const { execute, reset, result, status } = useAction(createTodoAction, {
    onError(data) {
      if (data.fetchError) {
        console.log('This is a Fetch Error')
      }
      if (data.serverError) {
        console.log('This is a server Error')
      }
      if (data.validationErrors) {
        console.log('This is a Validation Error')
      }
    },
    onSuccess(data) {
      console.log('DATA', data)
      if (data === null) {
        toast('Server Error', {
          description: 'Request Failed, Try Again',
          action: {
            label: 'Dismiss',
            onClick: () => console.log('Dismissed'),
          },
        })
      }
      if (data.id) {
        toast('Todo Added', {
          description: 'Todo Created Successfully',
          action: {
            label: 'Dismiss',
            onClick: () => console.log('Dismissed'),
          },
        })
      }
      if (data?.error) {
        toast('Create Todo Error', {
          description: data.error ? data.error : 'Request Failed, Try Again',
          action: {
            label: 'Dismiss',
            onClick: () => console.log('Dismissed'),
          },
        })
      }
      setName('')

      // if (data?.message) {
      //   toast('LoggedIn Successfully', {
      //     description: data.message ? data.message : 'Welcome Back',
      //     action: {
      //       label: 'Close',
      //       onClick: () => console.log('Close'),
      //     },
      //   })
      //   redirect('/todos')
      // }
      //   console.log(data)
    },
  })
  return (
    <>
      <Input
        type='text'
        onKeyDown={(e) => e.key === 'Enter' && execute({ title: name })}
        name='title'
        id='title'
        className=''
        placeholder='ENTER TODO'
        onChange={(e) => setName(e.target.value)}
        value={name}
      />

      <Button
        disabled={status === 'executing'}
        onClick={() => execute({ title: name })}
        type='button'
        className=''
      >
        <span>ADD TODO</span>
      </Button>
    </>
  )
}

export default CreateTodoButton
