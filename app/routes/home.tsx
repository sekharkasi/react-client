import type { Route } from "./+types/home";
import { Welcome } from "../welcome/welcome";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}


import { useLoaderData } from "react-router-dom";
import React, { StrictMode, useState, useEffect, useRef, useImperativeHandle} from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';  
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { redirect, useNavigate } from 'react-router';

import { showDemoNotifications } from "~/root";

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
    //const { loaderData, onTotalChange } = props;

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

    const isFullWidthCell = (params) => {
      return true;
    };

   const FullWidthRenderer = (props) => {
      const product = props.data;

      console.log("FullWidthRenderer", product);

      return (
        <div className="p-4 shadow rounded bg-white">
          <img src={product.image} alt="preview" className="w-full h-40 object-contain mb-2 rounded"/>
          <h3>{product.product_name}</h3>
          <p>{product.description}</p>
          <p>Price: ${product.price_per_unit}</p>
        </div>
      );
    };

      // Container: Defines the grid's theme & dimensions.
      return (
        <div style={{ width: "1000px", height: "500px" }}>
          <AgGridReact
              ref={gridRef}
              rowData={rowData}
              columnDefs={[]}
              frameworkComponents={{
                customTileRenderer: FullWidthRenderer,
              }}
              isFullWidthRow={() => true}
              fullWidthCellRenderer="customTileRenderer"
              getRowHeight={() => 150}
              rowStyle={{ display: 'block' }}
              suppressRowTransform={true}
              domLayout="autoHeight"
              suppressCellSelection={true}
          />
        </div>
      );
});    

export async function clientLoader({params}: Route.ClientLoaderArgs){
    
    console.log(" fetching active products");

    const data = await  fetch('http://localhost:19200/product/activeproducts',{
                        method: 'GET',
                        credentials: 'include'                        
                    //headers: {'Authorization':'Bearer '+ sessionStorage.getItem("token")}
                    })
                    .then((res)=> {                        
                            return res.json();
                    })
                    .catch((e)=> {
                        console.error("error", e);
                    });

      
    return data;
}

const ProductsTileView = ({ products }) => {
  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleQuantityChange = (productId: string, value: string) => {
    const qty = Math.max(1, parseInt(value) || 1);
    setQuantities(prev => ({ ...prev, [productId]: qty }));
  };

  const filteredProducts = products.filter(product => 
    product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

   const AddProductToCart = async (product, quantity) => {
       
        try{

            const response = await fetch(`http://localhost:19200/cart/add`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                  'Content-Type':'application/json',
                },
                body: JSON.stringify({
                  "items": [{
                    "product_id": product.id, 
                    "quantity": quantity
                  }]
                })
            });

            if (response.ok) {
                showDemoNotifications({title: 'Success', message: 'Item added to cart!', color: 'green'});

            } else {                
                showDemoNotifications({title: 'Failure', message: 'Failed to add item to cart', color: 'red'});
            }
        }
        catch(e){
            console.error(e);
        }
    }


  return (
    <div className="w-full max-w-[1000px] mx-auto">
      <div className="mb-4 px-4 w-full">
        <input
          type="text"
          placeholder="Search products..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white shadow rounded p-4">
            {product.image && <img src={product.image} alt="preview" className="w-full h-40 object-contain mb-2 rounded"/>}
            <h3 className="text-lg font-semibold text-center py-2">{product.product_name}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-blue-500 font-bold">₹{product.price_per_unit}</p>
            <div className="flex items-center mb-2">
              <label htmlFor={`qty-${product.id}`} className="mr-2">Qty:</label>
              <input
                id={`qty-${product.id}`}
                type="number"
                min={1}
                value={quantities[product.id] || 1}
                onChange={e => handleQuantityChange(product.id, e.target.value)}
                className="w-16 border input-border-gray hover:border-gray-700 rounded px-2 py-0"
              />
            </div>
            <div className="flex justify-center py-2">
              <button
                        onClick={()=> AddProductToCart(product, quantities[product.id] || 1)}
                        className='bg-gray-400 text-white px-2 py-0 rounded cursor-pointer'
                    >
                        Add to Cart
                    </button>  
            </div>
            

          </div>
        ))}
      </div>
    </div>
  );
};

export default function Home({loaderData}: Route.ComponentProps){
    const data = useLoaderData();
    let navigate = useNavigate();

      useEffect(() => {
        console.log(loaderData);
        if (loaderData?.message === "Unauthorized") {
              console.log('redirecting');
              navigate("/login");
        }
      }, [loaderData, navigate]);
  
    const gridComponentRef = useRef();
    const productGrid = loaderData?.data && (
                            <ProductsTileView products={loaderData.data} />
                        );

    // const handleAddProduct = (product) => {        
    //     if (gridComponentRef.current?.addRow) {
    //         console.log("handleAddProduct-> addrow");
    //         gridComponentRef.current.addRow([product]); // must pass as array
    //     }
    // };

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



// export default function Home() {
//   return <Welcome />;
// }
