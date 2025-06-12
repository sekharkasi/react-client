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
const CartGrid = React.forwardRef((props: { loaderData: LoaderData; onTotalChange: (total: number) => void }, ref) => {
  const { loaderData, onTotalChange } = props;
  const [rowData, setRowData] = useState<CartItem[]>([]);
  const gridRef = useRef<AgGridReact>(null);

  useEffect(() => {
    if (loaderData.data && Array.isArray(loaderData.data)) {
      setRowData(loaderData.data);
    }
  }, [loaderData.data]);

  // Calculate total price
  const totalPrice = rowData.reduce(
    (sum, item) => sum + item.quantity * item.product.price_per_unit,
    0
  );

  // Notify parent of total price
  useEffect(() => {
    onTotalChange(totalPrice);
  }, [totalPrice, onTotalChange]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const response = await fetch(`http://localhost:19200/cart/items/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Failed to delete cart item');
      setRowData(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      //alert('Error deleting cart item');
      showDemoNotifications({title: 'Failure', message: 'Error deleting cart item', color: 'red'});
      console.error(error);
    }
  };

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
        return `$${params.value?.toFixed(2)}`;
      }
    },
    {
      headerName: 'Total',
      width: 120,
      valueGetter: (params: any) => {
        // For pinned row, use the precomputed total
        if (params.node.rowPinned) return params.data.total;
        return params.data.quantity * params.data.product.price_per_unit;
      },
      valueFormatter: (params: any) => {
        if (params.value === '' || params.value == null || params.value == undefined) return '';
        return `$${params.value?.toFixed(2)}`;
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
    },
    {
      headerName: 'Actions',
      field: 'actions',
      width: 120,
      cellRenderer: (params: any) => {
        return (
          <button
            className="bg-red-500 text-white px-2 py-0 rounded hover:bg-red-600"
            onClick={() => handleDelete(params.data.id)}
          >
            Delete
          </button>
        );
      }
    }
  ];

  // Pinned bottom row for total
  //const pinnedBottomRowData = [
  //  {
  //    product: { product_name: 'Total' },
  //    quantity: '',
  //    productId: '',
  //    userId: '',
  //    addedAt: '',
  //    total: totalPrice
  //  }
  //];

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
        //pinnedBottomRowData={pinnedBottomRowData}
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
  const [total, setTotal] = useState(0);

  // Place Order handler
  const handlePlaceOrder = async () => {
    try {
      // You can adjust the payload as needed for your backend
      const response = await fetch('http://localhost:19200/order/saveorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ total_amount: total })
      });
      if (!response.ok) throw new Error('Failed to place order');
      //alert('Order placed successfully!');
      showDemoNotifications({title: 'Success', message: 'Order placed successfully!', color: 'green'});
      // Optionally, redirect or refresh
      window.location.reload();
    } catch (error) {
      //alert('Error placing order');
      showDemoNotifications({title: 'Failure', message: 'Error placing order', color: 'red'});
      console.error(error);
    }
  };

  const cartGrid = loaderData?.data && (
    <CartGrid ref={gridComponentRef} loaderData={loaderData} onTotalChange={setTotal} />
  );

  return (
    <main className="flex items-center justify-center pt-16 pb-4">
      <div className="flex-1 flex flex-col items-center gap-16 min-h-0">
        <div>
          <div>
            {cartGrid}
          </div>
          <div className="flex justify-end mt-4 w-full" style={{ maxWidth: 1000 }}>
            <span className="text-lg font-semibold mr-6">Total: ${total?.toFixed(2)}</span>
            <button
              className="bg-green-600 text-white px-6 py-2 rounded font-bold hover:bg-green-700"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </main>
  );
} 