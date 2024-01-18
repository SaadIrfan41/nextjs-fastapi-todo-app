'use server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { z, ZodType } from 'zod'
import { NextResponse, NextRequest } from 'next/server'
import { addTodoSchema, deleteTodoSchema, loginFormSchema } from './schemas'
import { createSafeActionClient } from 'next-safe-action'
import { redirect } from 'next/navigation'

export const action = createSafeActionClient()

const login_request = async (request_form_data: FormData) => {
  try {
    const response = await fetch(
      `${
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL_PROD
          : process.env.BACKEND_URL
      }/api/auth/token`,
      {
        method: 'POST',
        body: request_form_data,
        cache: 'no-store',
      }
    )
    // if (!response || response.status !== 200) {
    //   throw new Error(response.statusText)
    // }
    const res = await response.json()
    // console.log(res)
    if (res.detail) {
      console.log(res.detail)
      return { error: res.detail }
    }
    if (res.access_token) {
      cookies().set('access_token', res.access_token)
      return { message: 'Logged In Successfully' }
      // return NextResponse.redirect(
      //   `${
      //     process.env.NODE_ENV === 'production'
      //       ? process.env.FRONTEND_URL_PROD
      //       : process.env.FRONTEND_URL_DEV
      //   }/todos`
      // )
      // redirect('http://localhost:3000/todos')
    }
  } catch (error) {
    console.error('Login Error:', error)
  }
}

export const createLoginAction = action(
  loginFormSchema,
  async ({ username, password }) => {
    if (!username || !password) {
      return { error: 'Invalid Fields!' }
    }

    const request_form_data = new FormData()
    request_form_data.append('username', username)
    request_form_data.append('password', password)
    const res = await login_request(request_form_data)
    if (res?.message === 'Logged In Successfully') {
      redirect('/todos')
    }
    return res
  }
)

const create_todo_request = async (title: string) => {
  try {
    const response = await fetch(
      `${
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL_PROD
          : process.env.BACKEND_URL
      }/api/todos/create_todo`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cookies().get('access_token')?.value}`,
        },
        body: JSON.stringify({
          title,
          complete: 'False',
        }),
        cache: 'no-store',
      }
    )
    const res = await response.json()
    if (res.detail) {
      console.log('This is response Detail', res.detail)
      return { error: res.detail[0].msg }
    }
    return res
  } catch (error) {
    console.error('Create Todo Error:', error)
  }
}

export const createTodoAction = action(addTodoSchema, async ({ title }) => {
  if (!title) {
    return { error: 'Title not avaliable' }
  }

  const res = await create_todo_request(title)
  revalidatePath('/todos')
  // if (res?.message === 'Logged In Successfully') {
  //   redirect('/todos')
  // }
  return res
})

const delete_todo_request = async (id: number) => {
  try {
    const response = await fetch(
      `${
        process.env.NODE_ENV === 'production'
          ? process.env.FRONTEND_URL_PROD
          : process.env.BACKEND_URL
      }/api/todos/${id}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${cookies().get('access_token')?.value}`,
        },
        cache: 'no-store',
      }
    )
    const res = await response.json()
    if (res.detail) {
      console.log('This is response Detail', res.detail)
      return { error: res.detail[0].msg }
    }
    return res
  } catch (error) {
    console.error('Delete Todo Error:', error)
  }
}

export const deleteTodoAction = action(deleteTodoSchema, async ({ id }) => {
  if (!id) {
    return { error: 'ID not avaliable' }
  }

  const res = await delete_todo_request(id)
  revalidatePath('/todos')

  return res
})
