import { z } from 'zod'

export const loginFormSchema = z.object({
  username: z.string().trim().min(1, { message: 'UserName is required' }),
  password: z.string().trim().min(1, { message: 'Password is required' }),
})
export const registerFormSchema = z.object({
  username: z.string().trim().min(1, { message: 'UserName is required' }),
  email: z.string().email(),
  password: z.string().trim().min(1, { message: 'Password is required' }),
})
export const addTodoSchema = z.object({
  title: z.string().trim().min(1, { message: 'Title is required' }),
})
export const deleteTodoSchema = z.object({
  id: z.number().min(1, { message: 'ID is required' }),
})
