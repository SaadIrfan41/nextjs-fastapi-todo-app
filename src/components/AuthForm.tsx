'use client'
import { Button } from '@/components/ui/button'
// import { cookies } from 'next/headers'

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
// import { useFormState, useFormStatus } from 'react-dom'
import { createLoginAction } from '@/lib/actions'
import LoginButton from './LoginButton'
import { toast } from 'sonner'
import { loginFormSchema, registerFormSchema } from '@/lib/schemas'
import { useAction } from 'next-safe-action/hooks'

// export const loginFormSchema = z.object({
//   username: z.string().trim().min(1, { message: 'UserName is required' }),
//   password: z.string().trim().min(1, { message: 'Password is required' }),
// })
// export const registerFormSchema = z.object({
//   username: z.string().trim().min(1, { message: 'UserName is required' }),
//   email: z.string().email(),
//   password: z.string().trim().min(1, { message: 'Password is required' }),
// })

export function AuthForm() {
  //   const [state, dispatch] = useFormState(login_action, null)
  //   const { pending } = useFormStatus()

  const loginForm = useForm<z.infer<typeof loginFormSchema>>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })
  const registerForm = useForm<z.infer<typeof registerFormSchema>>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
    },
  })

  const { execute, reset, result, status } = useAction(createLoginAction, {
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
      if (data?.error) {
        toast('Auth Error', {
          description: data.error ? data.error : 'Request Failed, Try Again',
          action: {
            label: 'Dismiss',
            onClick: () => console.log('Dismissed'),
          },
        })
      }
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

  async function loginOnSubmit(values: z.infer<typeof loginFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)

    try {
      execute(values)
    } catch (error) {
      console.log(error)
    }
  }
  function registerOnSubmit(values: z.infer<typeof loginFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Tabs defaultValue='login' className='w-[400px]'>
      <TabsList className='grid w-full grid-cols-2'>
        <TabsTrigger value='login'>Login</TabsTrigger>
        <TabsTrigger value='register'>Register</TabsTrigger>
      </TabsList>
      <TabsContent value='login'>
        <Card className=''>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>
              Enter your username and password to login
            </CardDescription>
          </CardHeader>
          <CardContent className=''>
            <Form {...loginForm}>
              <form
                // action={dispatch}
                onSubmit={loginForm.handleSubmit(loginOnSubmit)}
                className='space-y-5'
              >
                <FormField
                  control={loginForm.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your username' {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        This is your public display name.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={loginForm.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your password' {...field} />
                      </FormControl>
                      {/* <FormDescription>
                        This is your public display name.
                      </FormDescription> */}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <LoginButton /> */}
                <Button disabled={status === 'executing'} type='submit'>
                  Submit
                </Button>
              </form>
            </Form>
            {/* <div className='space-y-1'>
              <Label htmlFor='username'>UserName</Label>
              <Input id='name' defaultValue='Pedro Duarte' />
            </div>
            <div className='space-y-1'>
              <Label htmlFor='username'>Username</Label>
              <Input id='username' defaultValue='@peduarte' />
            </div> */}
          </CardContent>
          {/* <CardFooter>
            <Button>Save changes</Button>
          </CardFooter> */}
        </Card>
      </TabsContent>
      <TabsContent value='register'>
        <Card>
          <CardHeader>
            <CardTitle>Register</CardTitle>
            <CardDescription>
              Fill the form to Create a new Account
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-2'>
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit(registerOnSubmit)}
                className='space-y-5'
              >
                <FormField
                  control={registerForm.control}
                  name='username'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your username' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name='email'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your Email' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={registerForm.control}
                  name='password'
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input placeholder='Enter your password' {...field} />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LoginButton />
                {/* <Button type='submit'>Submit</Button> */}
              </form>
            </Form>
          </CardContent>
          {/* <CardFooter>
            <Button>Save password</Button>
          </CardFooter> */}
        </Card>
      </TabsContent>
    </Tabs>
  )
}
