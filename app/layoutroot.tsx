// import {
//     isRouteErrorResponse,
//     Links,
//     Meta,
//     Outlet,
//     Scripts,
//     ScrollRestoration,
//     NavLink
//   } from "react-router";
  
//   import type { Route } from "./+types/root";
//   import { useNavigate } from "react-router";
  
//   import "./app.css"; 
//   import type React from "react";
   
//   export function Layout({ children }: { children: React.ReactNode }) {
  
//     return (
//       <html lang="en">
//         <head  className="bg-gray-300 text-brown p-4 text-xl font-semibold">
//           <meta charSet="utf-8" />
//           <meta name="viewport" content="width=device-width, initial-scale=1" />
            
//           <Meta />
//           <Links />
//         </head>
//         <body>
         
//         <div className="flex flex-col h-screen">
//            {/* Header */}
//            <header className="bg-gray-300 text-brown p-4 text-xl font-semibold">
//               Welcome to Orders Demo..
//           </header>   
  
//             <div className="flex flex-1 overflow-hidden">
//              <div>
//                 {children}
//              </div>
//             </div>
      
//             {/* Footer */}
//             <footer className="bg-gray-200 text-center p-3 text-sm text-gray-600">
//               © 2025 MyApp. All rights reserved.
//             </footer>
//         </div>
  
//           <ScrollRestoration />
//           <Scripts />
//         </body>
//       </html>
//     );
//   }
  
//   export default function App() {
//     return <Outlet />;
//   }
  