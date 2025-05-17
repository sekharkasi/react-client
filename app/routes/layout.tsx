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
  import { useNavigate } from "react-router";
  
  import "../app.css"; 
  import type React from "react";
   

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
    <div className="textAlignRight p-1 text-sm" onClick={signoutClick}>
        sign out
    </div>
  );
};


  export function Layout({ children }: { children: React.ReactNode }) {
  
    return (
      <html lang="en">
            <head  className="bg-gray-300 text-brown p-4 text-xl font-semibold">
              <meta charSet="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1" />
                
              <Meta />
              <Links />
            </head>
            <body>
             
            <div className="flex flex-col h-screen">
               {/* Header */}
               <header className="bg-gray-300 text-brown p-4 text-xl font-semibold">
                  Welcome to Inner layout demo
                <Signout/>
              </header>
        
      
                <div className="flex flex-1 overflow-hidden">
                  {/* Left Panel */}
                  <div className="w-1/8 bg-gray-100 border-r p-3 overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Menu</h2>
                  
                    <ul>
                      <li><NavLink to="/"  style={({isActive, isPending, isTransitioning})=> ({ color: isActive? "red": "black" })}>Dashboard</NavLink></li>
                      <li><NavLink to="/product"  style={({isActive, isPending, isTransitioning})=> ({ color: isActive? "red": "black" })}>Products</NavLink></li>
                    </ul>            
                  </div>
          
                  {/* Right Panel */}
                  <div className="flex-1 p-6 overflow-y-auto">
                    <h2 className="text-2xl font-semibold mb-4">Details</h2>
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
    return <Layout><Outlet /></Layout>;
  }
  