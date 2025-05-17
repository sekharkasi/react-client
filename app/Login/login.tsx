import { Button, Group, TextInput, MantineProvider, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate } from 'react-router';
import '@mantine/core/styles.css';


export function Login(){

    let navigate = useNavigate();

    const postSignIn = function(data: any){
            
            fetch('http://localhost:19200/auth/login',{
                method: 'POST',
                body: JSON.stringify(data),
                credentials: 'include',
                headers: {'Content-Type':'application/json'}

            })
            .then((res)=> {
                res.json().then((res)=> {
                    // console.log("cookie:: ", document.cookie);
                    // console.log("Success! ", res);
                    // sessionStorage.removeItem("token");
                    // sessionStorage.setItem("token", res.token);
                    navigate("/");
                });                

                //sessionStorage.setItem("token", jsonContent);

            })
            .catch((e)=> {
                console.error(e);
            });

    }


    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
          email: '',
          password:''
        }
      });
    
    return (
        <MantineProvider>
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <form onSubmit={form.onSubmit((values) => postSignIn(values))}>
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
            <Group justify="flex-end" mt="md">
                <Button type="submit" color="gray">Login</Button>
            </Group>
        </form>
      </div>
    </main>
    </MantineProvider>
    );
}