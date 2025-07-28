import { Button, Group, TextInput, MantineProvider, PasswordInput, NativeSelect } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router';
import { showDemoNotifications } from "~/root";


import '@mantine/core/styles.css';


export function SignUp(){

    let navigate = useNavigate();

    const postSignUp = function(data: any){
            console.log(data);
            fetch('http://localhost:19200/auth/signup',{
                method: 'POST',
                body: JSON.stringify(data),
                headers: {'Content-Type':'application/json'}

            })
            .then((res)=> {
                console.log("SUCCESS RESPONSE ", res);
                showDemoNotifications({title: 'Success', message: 'You have signed up successfully!', color: 'green'});
                navigate("/login");
            })
            .catch((e)=> {
                showDemoNotifications({title: 'Failure', message: 'Something went wrong', color: 'red'});
                console.error(e);
            });

    }


    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
          name:'',
          email: '',
          password:'',
          role: 'admin'
        },
    
        validate: {
          name: (value) => (value.trim() === '' ? 'Name is required' : null),
          email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),  
          password: (value) => (value.trim() === '' ? 'Password is required' : null),      
        },
      });
    
    return (
        <MantineProvider>
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <form onSubmit={form.onSubmit((values) => postSignUp(values))}  className="w-1/4">
            <TextInput
                withAsterisk
                label="Name"
                key={form.key('name')}
                {...form.getInputProps('name')}
            />
            <TextInput
                withAsterisk
                label="Email"
                placeholder="your@email.com"
                key={form.key('email')}
                {...form.getInputProps('email')}
            />
            <PasswordInput
                withAsterisk
                label="Password"
                key={form.key('password')}
                {...form.getInputProps('password')}
            />
            <NativeSelect
               mt="md"
               label="Role"
               data={['user', 'admin']}
               key={form.key('role')}
               description="Select Role"
                {...form.getInputProps('role')}
           />
            <Group justify="flex-end" mt="md">
                <Button type="submit" color="gray">Submit</Button>
            </Group>
        </form>
      </div>
    </main>
    </MantineProvider>
    );
}