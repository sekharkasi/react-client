import { Button, Group, TextInput, PasswordInput } from '@mantine/core';
import { useForm } from '@mantine/form';
import { useNavigate, NavLink } from 'react-router';
import '@mantine/core/styles.css';


export function Login(){

    let navigate = useNavigate();


    const postSignIn = async function(data: any){
            
        console.log("calling login method");

        
        const res = await fetch('http://localhost:19200/auth/login',{
                method: 'POST',
                body: JSON.stringify(data),
                credentials: 'include',
                headers: {'Content-Type':'application/json'}
            });

            
        const jsonRes = await res.json();

        if (jsonRes.user?.role) {

            sessionStorage.setItem("demoAppUserRole", jsonRes.user.role);
            

            setTimeout(() => {                
                console.log("Role set, now navigating...");
                navigate("/");
            }, 1000);
            
           
        } else {
            console.warn("No user role found in response");
        }


            
    }


    const form = useForm({
        mode: 'uncontrolled',
        initialValues: {
          email: '',
          password:''
        }
      });
    
    return (
    
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

            <p>Not registered? signup <NavLink to="/signup"  style={{ color: "blue" }}>here</NavLink> </p>
        </form>
      </div>
    </main>
    
    );
}