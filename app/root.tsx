import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  NavLink,
  useNavigate, 
  useLocation
} from "react-router";

import type { Route } from "./+types/root";

import "./app.css"; 
import type React from "react";
 

export function RootLayout({ children }: { children: React.ReactNode }) {

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
            Welcome to Demo app
        </header>
  

          <div className="flex flex-1 overflow-hidden">           
            {/* Right Panel */}
            <div className="flex-1 p-6 overflow-y-auto">
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

  const location = useLocation();
  const path = location.pathname.toLowerCase();

  const noLayoutPaths = ["/login", "/signup"];
  const shouldUseLayout = noLayoutPaths.includes(path);

  if (shouldUseLayout) {
    return <RootLayout><Outlet /></RootLayout>;
  }

  return <Outlet />;
}
