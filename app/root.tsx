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
import { MantineProvider} from '@mantine/core';
import { Notifications, showNotification } from "@mantine/notifications";
import '@mantine/notifications/styles.css';
 

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
      <MantineProvider>
          <div className="flex flex-col h-screen">
            {/* Header */}
            <header className="bg-gray-300 text-brown p-4 text-xl font-semibold">
                Welcome to Demo app
            </header>
      
            <Notifications position="top-right" zIndex={2077}>
            </Notifications>

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
        </MantineProvider>
      </body>
    </html>
  );
}

/**
 * Show a notification with a title, message, and color.
 * @param props - The props object containing title, message, and color.
 */
export function showDemoNotifications(props: {title: string, message: string, color: string}) {  

  console.log("Props", props);

  showNotification({
    title: props.title??'Success',
    message: props.message,
    color: props.color?? 'green', // green color for success, red for failure
    autoClose: 3000, // closes after 3 seconds
  });
  console.log("show notification called");
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
