import {
    isRouteErrorResponse,
    Links,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    NavLink
  } from "react-router";
  
  import type { Route } from "../+types/root";
  import { useNavigate, useLocation } from "react-router";
  
  import { Notifications } from '@mantine/notifications';
  
  import "../app.css"; 
  import type React from "react";
  import { MantineProvider } from '@mantine/core';    
  import '@mantine/core/styles.css';
  import '@mantine/notifications/styles.css';
  
   
        
export function Signout() : React.ReactElement {
    
  let navigate = useNavigate();

  function signoutClick() {
      
    console.log("signoutClick");

      fetch('http://localhost:19200/auth/logout',{
        method: 'POST',
        credentials: 'include'                        
      //headers: {'Authorization':'Bearer '+ sessionStorage.getItem("token")}
      })
      .then((res)=> {
        navigate('/login');
      })
      .catch((e)=> {
          console.error(e);
      });
  }

  return (
    <div className="font-sarif font-semibold signout-button" onClick={signoutClick}>
        <p>sign out</p>
    </div>
  );
};


  export function Layout({ children }: { children: React.ReactNode }) {
  
    const location = useLocation();

    const routeTitles = {
      "/": "Dashboard",
      "/product": "Products",
      "/customer": "Customers",
      "/order": "Orders",
      "/cart": "Shopping Cart",
    };

    
    const title = routeTitles[location.pathname as keyof typeof routeTitles] || "Dashboard";

    const userRole = sessionStorage.getItem("demoAppUserRole");


    return (
      <html lang="en">
            <head  className="bg-gray-300 text-brown p-4 text-xl font-semibold">
              <meta charSet="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
                
              <Meta />
              <Links />
            </head>


            <body  className="font-sans bg-white text-gray-900">

              <MantineProvider>
              <Notifications position="top-right" zIndex={2077}>
               </Notifications>
              </MantineProvider>

                  <div className="flex flex-col h-screen">
                    {/* Header */}
                    <header className="bg-gray-200 text-brown p-4 text-xl font-semibold">
                        Welcome to React app demo
                      <Signout/>
                    </header>
              
            
                      <div className="flex flex-1 overflow-hidden">
                        {/* Left Panel */}
                        <div className="font-sarif font-semibold  w-1/8 bg-gray-100  p-8 overflow-y-auto">
                          
                        
                          <ul>
                            <li><NavLink to="/"  style={({isActive, isPending, isTransitioning})=> ({ color: isActive? "red": "black" })}>Dashboard</NavLink></li>                           
                            <li><NavLink to="/cart"  style={({isActive, isPending, isTransitioning})=> ({ color: isActive? "red": "black" })}>Cart</NavLink></li>
                            <li><NavLink to="/order"  style={({isActive, isPending, isTransitioning})=> ({ color: isActive? "red": "black" })}>Orders</NavLink></li>
                            {userRole=="admin" && (
                                <>
                                  <li><NavLink to="/product"  style={({isActive, isPending, isTransitioning})=> ({ color: isActive? "red": "black" })}>Products</NavLink></li>
                                  <li><NavLink to="/customer"  style={({isActive, isPending, isTransitioning})=> ({ color: isActive? "red": "black" })}>Customers</NavLink></li>
                                </>
                              )
                            }
                          </ul>            
                        </div>
                
                        {/* Right Panel */}
                        <div className="flex-1 p-6 overflow-y-auto">
                          <h2 className="text-2xl font-semibold mb-3">{title}</h2>
                            {children}
                        </div>
                      </div>
                
                      {/* Footer */}
                      <footer className="bg-gray-200 text-center p-3 text-sm text-gray-600">
                        © 2025 MyApp. All rights reserved.
                      </footer>
                  </div>
               
              <ScrollRestoration />
              <Scripts />
            </body>
          </html>
    );
  }
  
  export default function App() {
    return (
          <Layout>      
            <Outlet />
          </Layout>);
  }
  