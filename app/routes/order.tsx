import type {Route} from './+types/order';

import { useLoaderData } from "react-router-dom";
import React, { StrictMode, useState, useEffect, useRef, useImperativeHandle} from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';   
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { useNavigate } from 'react-router';

//Load AG Grid 
ModuleRegistry.registerModules([AllCommunityModule]);

type Order = {
  user_id: string;
  order_id: string;  
  total_amount: number;
  status: string;
  id: string;
};

type LoaderData = {
  data: Order[];
};

// Create new GridExample component
const OrdersGrid = React.forwardRef((props: { loaderData: LoaderData }, ref) => {
  const { loaderData } = props;

    const [rowData, setRowData] = useState([]);
    const gridRef = useRef();

    const userrole = sessionStorage.getItem("demoAppUserRole");

    useEffect(() => {
        if (loaderData.data && Array.isArray(loaderData.data)) {
            setRowData(loaderData.data); // Set the full array once
          }
    }, [loaderData.data]);


    // Column Definitions: Defines & controls grid columns.
    const orderColumnDefs = [
        { field: 'user.name', headerName: 'Customer' , hide: userrole != "admin"},
        {
          headerName: 'Items',
          valueGetter: (params) => {
          const items = params.data.order_items;
          if (!items || items.length === 0) return '—';
          return items.map(i => `${i.quantity}x ${i.product?.product_name}`).join(', ');
        }
        },
        { field: 'total_amount', headerName: 'Total Amount' },
        { field: 'status', headerName: 'Status' },               
        { field: "createdAt", headerName: 'Date & Time',
          valueFormatter: (params) => {
            const date = new Date(params.value);
            return date.toLocaleDateString() +' '+ date.toLocaleTimeString(); // Or use moment.js/dayjs if needed
        } }
        ];

        // Container: Defines the grid's theme & dimensions.
      return (
        <div style={{ width: "1000px", height: "500px" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={orderColumnDefs}
            ref = {gridRef}     
          />
        </div>
      );
});    

export async function clientLoader({params}: Route.ClientLoaderArgs){
    
    const data = await  fetch('http://localhost:19200/order/orders',{
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

export default function order({loaderData}: Route.ComponentProps){
    const data = useLoaderData();
    let navigate = useNavigate();

    const gridComponentRef = useRef();
    const orderGrid = loaderData?.data && (
                            <OrdersGrid ref={gridComponentRef} loaderData={loaderData} />
                        );

    // const handleAddorder = (order) => {        

    //     if (gridComponentRef.current?.addRow) {
    //         console.log("handleAddorder-> addrow");
    //         gridComponentRef.current.addRow([order]); // must pass as array
    //     }
    // };

    //return <orderPage/>
    return(
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
                <div>
                    {/* <Popup onAddorder={handleAddorder}/> */}
                    <div >
                        {orderGrid}
                    </div>
                </div>
            </div>
        </main>
    );

}
