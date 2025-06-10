import type { Route } from '.react-router/types/app/routes/+types/cart';
import { useLoaderData } from "react-router-dom";
import React, { useState, useEffect, useRef } from "react";
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';   
import { AgGridReact } from 'ag-grid-react';
import { useNavigate } from 'react-router';

// Load AG Grid 
ModuleRegistry.registerModules([AllCommunityModule]);

type CartItem = {
  id: string;
  userId: string;
  productId: string;
  quantity: number;
  addedAt: string;
  product: {
    product_name: string;
    price_per_unit: number;
  };
};

type LoaderData = {
  data: CartItem[];
};

// Create CartGrid component
const CartGrid = React.forwardRef((props: { loaderData: LoaderData }, ref) => {
  const { loaderData } = props;
  const [rowData, setRowData] = useState<CartItem[]>([]);
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    if (loaderData.data && Array.isArray(loaderData.data)) {
      setRowData(loaderData.data);
    }
  }, [loaderData.data]);

  // Column Definitions
  const cartColumnDefs = [
    { 
      field: 'product.product_name', 
      headerName: 'Product Name',
      flex: 1
    },
    { 
      field: 'quantity', 
      headerName: 'Quantity',
      width: 100
    },
    { 
      field: 'product.price_per_unit', 
      headerName: 'Price per Unit',
      width: 120,
      valueFormatter: (params: any) => {
        return `$${params.value.toFixed(2)}`;
      }
    },
    {
      headerName: 'Total',
      width: 120,
      valueGetter: (params: any) => {
        return params.data.quantity * params.data.product.price_per_unit;
      },
      valueFormatter: (params: any) => {
        return `$${params.value.toFixed(2)}`;
      }
    },
    { 
      field: "addedAt",
      headerName: "Added Date",
      width: 180,
      valueFormatter: (params: any) => {
        const date = new Date(params.value);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
      }
    }
  ];

  return (
    <div style={{ width: "1000px", height: "500px" }}>
      <AgGridReact
        rowData={rowData}
        columnDefs={cartColumnDefs}
        ref={gridRef}
        defaultColDef={{
          sortable: true,
          filter: true,
          resizable: true
        }}
      />
    </div>
  );
});

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await fetch('http://localhost:19200/cart/items', {
    method: 'GET',
    credentials: 'include'
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Failed to fetch cart items');
      }
      return res.json();
    })
    .catch((e) => {
      console.error('Error fetching cart items:', e);
      return { data: [] };
    });
  return data;
}

export default function Cart({ loaderData }: Route.ComponentProps) {
  const data = useLoaderData();
  const navigate = useNavigate();
  const gridComponentRef = useRef<typeof CartGrid>(null);
  const [productId, setProductId] = useState('');
  const [quantity, setQuantity] = useState(1);


  const cartGrid = loaderData?.data && (
    <CartGrid ref={gridComponentRef} loaderData={loaderData} />
  );

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div>
          <h1 className="text-2xl font-bold mb-4">Shopping Cart</h1>          
          {/* Add to Cart Form */}      
          <div>
            {cartGrid}
          </div>
        </div>
      </div>
    </main>
  );
} 