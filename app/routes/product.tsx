import type {Route} from './+types/product';

import { useLoaderData } from "react-router-dom";
import React, { StrictMode, useState, useEffect, useRef, useImperativeHandle} from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';   
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { useNavigate } from 'react-router';
import { showDemoNotifications } from "~/root";
import { openConfirmModal } from '@mantine/modals';


//Load AG Grid 
ModuleRegistry.registerModules([AllCommunityModule]);

type Product = {
  image?: string;
  product_name: string;  
  description: string;
  active: boolean;
  price_per_unit: string;
  id: string;
};

type LoaderData = {
  data: Product[];
};


// Create new GridExample component
const ProductsGrid = React.forwardRef((props: { loaderData: LoaderData }, ref) => {
  const { loaderData } = props;

    const [rowData, setRowData] = useState([]);

    const gridRef = useRef();

    const addRow = (data)=> {
        console.log("addRow", data);
        gridRef.current.api.applyTransaction({add: data});
    }

    useImperativeHandle(ref, () => ({
        addRow
    }));

    const handleDelete = async (product) => {
        const confirmation = confirm(`Are you sure you want to delete ${product.product_name}?`);
        if(!confirmation)
            return;

        try{

            const response = await fetch(`http://localhost:19200/product/${product.id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                //const gridRef = useRef();
                gridRef.current.api.applyTransaction({ remove: [product] });                
                showDemoNotifications({title: 'Success', message: 'Product deleted successfully!', color: 'green'});

            } else {
                showDemoNotifications({title: 'Failure', message: 'Something went wrong', color: 'red'});
                console.error('Failed to delete product');
            }
        }
        catch(e){
            console.error(e);
        }
    }

    const onCellEdit = async (event) => {
        try{

            const product = event.data;
            console.log("product", product);

            const response = await fetch(`http://localhost:19200/product/${product.id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(product)
            });

            if (!response.ok) {
                console.error('Failed to delete product');
            }
        }
        catch(e){
            console.error(e);
        }
    }

    useEffect(() => {
        console.log(loaderData.data);

        if (loaderData.data && Array.isArray(loaderData.data)) {
            setRowData(loaderData.data); // Set the full array once
          }
    }, [loaderData.data]);


    // Column Definitions: Defines & controls grid columns.
    const [colDefs, setColDefs] = useState([
      {
        headerName: "Product", 
        cellRenderer: (params)=> {
            
            return params.data.image && (
                        <img
                            src={params.data.image}
                            alt="Preview"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain',
                                border: 'none'
                            }}
                            className="w-full h-40 object-contain mb-2 rounded"
                        />                
                    );
        }
      },
      { field: "product_name", editable:true },
      { field: "price_per_unit", editable:true },      
      { field: "description", editable:true },
      { field: "active" , editable:true},
      {
        headerName: "Actions", 
        cellRenderer: (params)=> {
            return(
                <button
                    onClick={()=> handleDelete(params.data)}
                    className='bg-red-400 text-white px-3 py-0 rounded cursor-pointer'
                >
                    Delete
                </button>                
            );
        }
      }
    ]);

    const defaultColDef = {
        flex: 1,
      };

      // Container: Defines the grid's theme & dimensions.
      return (
        <div style={{ width: "1000px", height: "500px" }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            defaultColDef={defaultColDef}
            ref = {gridRef}
            onCellValueChanged={onCellEdit}
          />
        </div>
      );
});    

export async function clientLoader({params}: Route.ClientLoaderArgs){
    
    const data = await  fetch('http://localhost:19200/product/products',{
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

export default function product({loaderData}: Route.ComponentProps){
    const data = useLoaderData();
    let navigate = useNavigate();

    const gridComponentRef = useRef();
    const productGrid = loaderData?.data && (
                            <ProductsGrid ref={gridComponentRef} loaderData={loaderData} />
                        );

    const handleAddProduct = (product) => {        

        console.log("adding product to grid ", product);
        if (gridComponentRef.current?.addRow) {
            console.log("handleAddProduct-> addrow");
            gridComponentRef.current.addRow([product]); // must pass as array
        }
    };

    //return <ProductPage/>
    return(
        <main className="flex items-center justify-center pt-16 pb-4">
            <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
                <div>
                    <Popup onAddProduct={handleAddProduct}/>
                    <div >
                        {productGrid}
                    </div>
                </div>
            </div>
        </main>
    );

}

export function AddProductsPopup({closePopup, onAddProduct}){

    const [rowData, setRowData] = useState([]);
    const[product, setProduct] = useState({"product_name":"", "image":undefined, "description":"", "active":true, "price_per_unit":'' });

    const handleInputChange = (e)=>{

         const { name, value, files } = e.target;

        if(e.target.name == "image" && files && files[0]){
            const reader = new FileReader();
            reader.onloadend = ()=>{

                console.log("reader.result", reader.result);

                setProduct({...product, [e.target.name]: reader.result})
            }
            reader.readAsDataURL(files[0]);
        }
        else if(e.target.name == "price_per_unit" ){
            console.log("e.target.name", parseInt(e.target.value))
            setProduct({...product,[e.target.name]: parseInt(e.target.value)});
        }
        else{
            setProduct({...product,[e.target.name]:e.target.value});
        }
        console.log('set product called', product);
    }

    const handleSaveProduct = async()=> {     

        console.log("product ", product);

        const savedProduct = await saveProduct(product);
        if (savedProduct) {            
            // add product to AG Grid with the correct id
            onAddProduct(savedProduct.product);
            closePopup();
        }
    }

    return (
       <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-3 rounded-lg shadow-lg w-[500px]">
            <div className="text-center mb-4">
                <h2 className="bg-gray-400 text-white px-0 py-0 rounded">Add Product</h2>
            </div>
             {/* <Form method="post" onSubmit={() => closePopup()}> */}
                <input
                type="text"
                name="product_name"
                placeholder="Product Name"
                value={product.product_name}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                type="file"
                accept='image/*'
                name="image"
                placeholder="Product Image"                
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {product.image && (
                    <img
                        src={product.image}
                        alt="Preview"
                        className='w-full h-40 object-contain mb-2 border rounded'
                    >                    
                    </img>                    
                )}
                <input
                type="string"
                name="description"
                placeholder="Description"
                value={product.description}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                type="double"
                name="price_per_unit"
                placeholder="Price"
                value={product.price_per_unit}
                onChange={handleInputChange}
                className="w-full border border-gray-300 rounded px-4 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <div className="flex justify-end space-x-2">
                <button onClick={closePopup} className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded shadow">
                    Cancel
                </button>
                <button
                    onClick={handleSaveProduct}
                    className="text-gray-600 hover:text-gray-800 px-5 py-2 rounded"
                >
                    Add
                </button>
                </div>
            {/* </Form> */}
          </div>
        </div>
    );
}

export function Popup({onAddProduct}){

    const [isOpen, setIsOpen] = useState(false);

    const toggleIsOpen = () =>{
        setIsOpen(!isOpen);
    }
    return (
        <div className="flex justify-end">
            <button 
                onClick={toggleIsOpen} 
                className="bg-gray-400 text-white px-4 py-2 rounded cursor-pointer hover:bg-gray-500"
            >
                Add Products
            </button>
            {isOpen && (
                <AddProductsPopup closePopup={toggleIsOpen} onAddProduct={onAddProduct}/>
            )}
        </div>
    );
}

const saveProduct = async (product: Product) => {
  try {
    // Optional: validate fields here before submitting

    // Make the POST request to your backend API
    const response = await fetch('http://localhost:19200/product/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + token  // optional if needed
      },
      credentials: 'include', // if using cookies/session
      body: JSON.stringify(product),
    });

    if (!response.ok) {      
        showDemoNotifications({title: 'Failure', message: 'Something went wrong', color: 'red'});
        throw new Error('Failed to save product');
    }
    else{
        showDemoNotifications({title: 'Success', message: 'Product added successfully!', color: 'green'});
        const savedProduct = await response.json(); // <-- get the product with id from server
        return savedProduct;
    }

    // // Notify parent to add the product to AG Grid
    // onAddProduct(product);
    // closePopup();
  } catch (err) {
    console.error(err);
    alert('Failed to save product');
  }
};

