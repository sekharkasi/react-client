import type {Route} from './+types/Customer';

import { useLoaderData } from "react-router-dom";
import type { LoaderFunctionArgs } from "react-router-dom";

import React, { StrictMode, useState, useEffect, useRef, useImperativeHandle} from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';   
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { useNavigate } from 'react-router';


//Load AG Grid 
ModuleRegistry.registerModules([AllCommunityModule]);


type Customer = {
  id: string;
  name: string;  
  email: string;
  role: string;
  createdAt: Date;
};

type LoaderData = {
  data: Customer[];
};


// Create new GridExample component
const CustomersGrid = React.forwardRef((props: { loaderData: LoaderData }, ref) => {
  const { loaderData } = props;

    console.log("ref--> ", ref);

    const [rowData, setRowData] = useState([]);

    const gridRef = useRef();
    // const addRow = (data)=> {
    //     console.log("addRow", data);
    //     gridRef.current.api.applyTransaction({add: data});
    // }
    // useImperativeHandle(ref, () => ({
    //     addRow
    // }));


    useEffect(() => {
        console.log(loaderData.data);

        if (loaderData.data && Array.isArray(loaderData.data)) {
            setRowData(loaderData.data); // Set the full array once
          }
    }, [loaderData.data]);


    // Column Definitions: Defines & controls grid columns.
    const [colDefs, setColDefs] = useState([
      { field: "name" },
      { field: "email" },
      { field: "role" },      
      { field: "createdAt",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleDateString() +' '+ date.toLocaleTimeString(); // Or use moment.js/dayjs if needed
      } }
    ]);

    const defaultColDef = {
        flex: 1,
        sortable: true,
        filter: true,
        resizable: true
      };

      // Container: Defines the grid's theme & dimensions.
      return (
        <div style={{ width: "1000px", height: "500px" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            ref = {gridRef}
            
          />
        </div>
      );
});    

export async function clientLoader({params}: Route.ClientLoaderArgs){
    
    const data = await  fetch('http://localhost:19200/customer/Customers',{
                        method: 'GET',
                        credentials: 'include'                        
                    //headers: {'Authorization':'Bearer '+ sessionStorage.getItem("token")}
                    })
                    .then((res)=> {                        
                            return res.json();
                    })
                    .catch((e)=> {
                        console.error(e.status);                        
                    });
    return data;
}

export default function Customer({loaderData}: Route.ComponentProps){
    const data = useLoaderData();
    let navigate = useNavigate();

    const gridComponentRef = useRef();
    const CustomerGrid = loaderData?.data && (
                            <CustomersGrid ref={gridComponentRef} loaderData={loaderData} />
                        );

    // const handleAddCustomer = (Customer) => {        
    //     if (gridComponentRef.current?.addRow) {
    //         console.log("handleAddCustomer-> addrow");
    //         gridComponentRef.current.addRow([Customer]); // must pass as array
    //     }
    // };

    //return <CustomerPage/>
    return(
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
                <div>
                    {/* <Popup onAddCustomer={handleAddCustomer}/> */}
                    <div >
                        {CustomerGrid}
                    </div>
                </div>
            </div>
        </main>
    );

}

// export function AddCustomersPopup({closePopup, onAddCustomer}){

//     const [rowData, setRowData] = useState([]);
//     const[Customer, setCustomer] = useState({"Customer_name":"", "image":undefined, "description":"", "active":true, "price_per_unit":'' });

//     const handleInputChange = (e)=>{
//         setCustomer({...Customer,[e.target.name]:e.target.value});
//         console.log('set Customer called', Customer);
//     }

//     const handleAddCustomer = ()=> {     
//         //save Customer
//         saveCustomer(Customer);
     
//         //add Customer to AG Grid
//         onAddCustomer(Customer);
//         closePopup();
//     }

//     return (
//        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
//           <div className="bg-white p-3 rounded-lg shadow-lg w-80">
//             <h2 className="text-lg font-bold mb-4">Add Customer</h2>
//              <Form method="post" onSubmit={() => closePopup()}>
//                 <input
//                 type="text"
//                 name="Customer_name"
//                 placeholder="Customer Name"
//                 value={Customer.Customer_name}
//                 onChange={handleInputChange}
//                 className="w-full border px-3 py-2 mb-2"
//                 />
//                 <input
//                 type="file"
//                 accept='image/*'
//                 name="image"
//                 placeholder="Customer Image"
//                 value={Customer.image}
//                 onChange={handleInputChange}
//                 className="w-full border px-3 py-2 mb-2"
//                 />
//                 <input
//                 type="string"
//                 name="description"
//                 placeholder="Description"
//                 value={Customer.description}
//                 onChange={handleInputChange}
//                 className="w-full border px-3 py-2 mb-4"
//                 />
//                 <input
//                 type="double"
//                 name="price_per_unit"
//                 placeholder="Price"
//                 value={Customer.price_per_unit}
//                 onChange={handleInputChange}
//                 className="w-full border px-3 py-2 mb-4"
//                 />
//                 <div className="flex justify-end space-x-2">
//                 <button onClick={closePopup} className="text-gray-600 px-3 py-1">
//                     Cancel
//                 </button>
//                 <button
//                     onClick={handleAddCustomer}
//                     className="bg-green-500 text-white px-3 py-1 rounded"
//                 >
//                     Add
//                 </button>
//                 </div>
//             </Form>
//           </div>
//         </div>
//     );
// }

// export function Popup({onAddCustomer}){

//     const [isOpen, setIsOpen] = useState(false);

//     const toggleIsOpen = () =>{
//         setIsOpen(!isOpen);
//     }
//     return (

//         <div>
//                 <div>
//                     <button onClick={toggleIsOpen}>Add Customers</button>
//                 </div>
//         {isOpen && (
//                 <AddCustomersPopup closePopup={toggleIsOpen} onAddCustomer={onAddCustomer}/>
//             )
//         }
//         </div>
//     );
// }

// const saveCustomer = async (Customer: Customer) => {
//   try {
//     // Optional: validate fields here before submitting

//     // Make the POST request to your backend API
//     const response = await fetch('http://localhost:19200/Customer/add', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         // 'Authorization': 'Bearer ' + token  // optional if needed
//       },
//       credentials: 'include', // if using cookies/session
//       body: JSON.stringify(Customer),
//     });

//     if (!response.ok) {
//       throw new Error('Failed to save Customer');
//     }

//     // // Notify parent to add the Customer to AG Grid
//     // onAddCustomer(Customer);
//     // closePopup();
//   } catch (err) {
//     console.error(err);
//     alert('Failed to save Customer');
//   }
// };