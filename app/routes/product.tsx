import type {Route} from './+types/product';

import { useLoaderData } from "react-router-dom";
import {ProductPage} from "~/Product/product_notused"
import type { LoaderFunctionArgs } from "react-router-dom";

import React, { StrictMode, useState, useEffect } from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';   
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { useNavigate } from 'react-router';



//Load AG Grid 
ModuleRegistry.registerModules([AllCommunityModule]);

//   let navigate = useNavigate();
//     navigate("/");

// Create new GridExample component
const ProductsGrid = (loaderData: any) => {

    const [rowData, setRowData] = useState([]);


    useEffect(() => {
        console.log(loaderData.data);

        if (loaderData.data && Array.isArray(loaderData.data)) {
            setRowData(loaderData.data); // Set the full array once
          }

        // loaderData.data.map(prd =>             
        //     setRowData(prd)
        // );
    }, [loaderData.data]);


    // Column Definitions: Defines & controls grid columns.
    const [colDefs, setColDefs] = useState([
      { field: "product_name" },
      { field: "price_per_unit" },
      { field: "image" },
      { field: "description" },
      { field: "active" },
    ]);

    const defaultColDef = {
        flex: 1,
      };
    
      //console.log(rowData, colDefs, defaultColDef);

      // Container: Defines the grid's theme & dimensions.
      return (
        <div style={{ width: "1000px", height: "500px" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
          />
        </div>
      );
};    

export async function clientLoader({params}: Route.ClientLoaderArgs){
    
    console.log("LOADERS CALLED");

    const data = await  fetch('http://localhost:19200/product/products',{
                        method: 'GET',
                        credentials: 'include'                        
                    //headers: {'Authorization':'Bearer '+ sessionStorage.getItem("token")}
                    })
                    .then((res)=> {                        
                        
                        console.log("Success res", res, res.status);
                        // if(res.status == 401) {
                        //     console.log("redirecting");                            
                        //     let navigate = useNavigate();
                        //     navigate("/");
                        //     //return;
                        // }
                        // else {
                            return res.json();
                        //}                        
                    })
                    .catch((e)=> {
                        console.error(e.status);                        
                    });
    return data;
}

export default function product({loaderData}: Route.ComponentProps){

    const data = useLoaderData();

    console.log("loaderData ", loaderData);

    let navigate = useNavigate();

    if(loaderData.message = "Unauthorized"){
        console.log("Navigating");
        navigate("/");
    }

    const productGrid = (loaderData==undefined || loaderData.data == undefined) ? '': ProductsGrid(loaderData);

    console.log("productGrid ", productGrid);

    //return <ProductPage/>
    return(
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
                <div>
                    <div >
                        {productGrid}
                    </div>
                </div>
            </div>
        </main>
    );

}