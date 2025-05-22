// import { useState } from "react";

// export function WelcomePage(){

//     const [selectedItem, setSelectedItem] = useState<string>('menu1');

//     return(

//         <div className="flex flex-col h-screen">
//         {/* Header */}
//         <header className="bg-gray-300 text-brown p-4 text-xl font-semibold">
//           Welcome to Orders Demo.....
//         </header>
  
//         {/* Main Content */}
//         <div className="flex flex-1 overflow-hidden">
//           {/* Left Panel */}
//           <div className="w-1/8 bg-gray-100 border-r p-3 overflow-y-auto">
//             <h2 className="text-xl font-bold mb-4">Menu</h2>
//             <ul>
              
//             <li
//                 key='menu1'
//                 className={`p-2 cursor-pointer rounded  'bg-blue-200'`}
//                 onClick={() => setSelectedItem('menu1')}
//               >
//                 Menu1
//               </li>
              
//               <li
//                 key='menu2'
//                 className={`p-2 cursor-pointer rounded  'bg-blue-200'`}
//                 onClick={() => setSelectedItem('menu2')}
//               >
//                 Menu2
//               </li>
//               <li
//                 key='menu3'
//                 className={`p-2 cursor-pointer rounded  'bg-blue-200'`}
//                 onClick={() => setSelectedItem('menu3')}
//               >
//                 Menu3
//               </li>
//             </ul>
//           </div>
  
//           {/* Right Panel */}
//           <div className="flex-1 p-6 overflow-y-auto">
//             <h2 className="text-2xl font-semibold mb-4">Details</h2>
//             <p className="text-lg">
//               Showing details for: <strong>{selectedItem}</strong>
//             </p>
//             <div className="mt-4 text-gray-600">
//               <p>This is where the detailed content for {selectedItem} will appear.</p>
//             </div>
//           </div>
//         </div>
  
//         {/* Footer */}
//         <footer className="bg-gray-200 text-center p-3 text-sm text-gray-600">
//           © 2025 MyApp. All rights reserved.
//         </footer>
//       </div>
//     );
// }