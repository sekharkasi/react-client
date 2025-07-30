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
import { Rating, Textarea, Button, Modal, Group, Text, Stack } from '@mantine/core';

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
  averageRating: number;
  totalReviews: number;
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

const ProductsTileView = ({ products }: { products: Product[] }) => {


  const [quantities, setQuantities] = useState<{ [productId: string]: number }>({});
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProduct, setReviewProduct] = useState<Product | null>(null);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [productReviews, setProductReviews] = useState<{[productId: string]: any[]}>({});
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [selectedProductForReviews, setSelectedProductForReviews] = useState<Product | null>(null);

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

    function handleProductClick(product: Product) {
      console.log("handleProductClick", product);
      setSelectedProduct(product);
    }

    function handleWriteReview(product: Product) {
      console.log("handleWriteReview", product);
      setReviewProduct(product);
      setReviewModalOpen(true);
      setRating(0);
      setReviewText('');
    }

    const saveProductReview = async () => {
      if (!reviewProduct || rating === 0) {
        showDemoNotifications({title: 'Error', message: 'Please provide a rating', color: 'red'});
        return;
      }

      try {
        const response = await fetch(`http://localhost:19200/product/reviews`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: reviewProduct.id,
            rating: rating,
            review: reviewText
          })
        });

        if (response.ok) {
          showDemoNotifications({title: 'Success', message: 'Review submitted successfully!', color: 'green'});
          setReviewModalOpen(false);
          setReviewProduct(null);
          setRating(0);
          setReviewText('');
        } else {
          const errorData = await response.json();
          showDemoNotifications({title: 'Error', message: errorData.message || 'Failed to submit review', color: 'red'});
        }
      } catch (error) {
        console.error('Error submitting review:', error);
        showDemoNotifications({title: 'Error', message: 'An error occurred while submitting the review', color: 'red'});
      }
    };

    const fetchProductReviews = async (productId: string) => {
      try {
        const response = await fetch(`http://localhost:19200/product/reviews/${productId}`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setProductReviews(prev => ({ ...prev, [productId]: data.data }));
          return data;
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    const handleViewReviews = async (product: Product) => {
      setSelectedProductForReviews(product);
      setReviewsModalOpen(true);
      await fetchProductReviews(product.id);
    };

  return (
    <>
      <div className="w-full max-w-[1200px] mx-auto flex flex-col md:flex-row">
        {/* Left: Product Grid */}
        <div className="w-full md:flex-1">

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
              <div 
                key={product.id} 
                className="bg-white shadow rounded p-4"
                onClick={() => handleProductClick(product)}
              >
                {product.image && <img src={product.image} alt="preview" className="w-full h-40 object-contain mb-2 rounded"/>}
                <h3 className="text-lg font-semibold text-center py-2">{product.product_name}</h3>
                <p className="text-gray-600">{product.description}</p>
                <div className="flex flex-col items-center mb-2">
                  <Rating value={product.averageRating} readOnly size="sm" />
                  <p className="text-xs text-gray-500 mt-1">
                    {product.totalReviews} review{product.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
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
                <div className="flex justify-center py-2 space-x-2">
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

        {/* Right: Product Details */}
        <div className="w-full md:w-1/3 p-4 bg-white shadow rounded ml-0 md:ml-4 mt-4 md:mt-0">
            <div className="mb-5">
              <label>Product details</label>
            </div>
            {selectedProduct ? (
              <>
                {selectedProduct.image && (
                  <img
                    src={selectedProduct.image}
                    alt="preview"
                    className="w-full h-60 object-contain mb-4 rounded"
                  />
                )}
                <h3 className="text-2xl text-center font-bold mb-2">{selectedProduct.product_name}</h3>
                <p className="mb-2">{selectedProduct.description}</p>
                <div className="flex flex-col items-center mb-2">
                  <Rating value={selectedProduct.averageRating} readOnly size="md" />
                  <p className="text-sm text-gray-500 mt-1">
                    {selectedProduct.totalReviews} review{selectedProduct.totalReviews !== 1 ? 's' : ''}
                  </p>
                </div>
                <p className="text-blue-600 font-semibold mb-2">₹{selectedProduct.price_per_unit}</p>
                <p className="mb-2">Status: {selectedProduct.active ? "Active" : "Inactive"}</p>
                <div className="flex items-center mb-2">
                  <label htmlFor={`qty-${selectedProduct.id}`} className="mr-2">Qty:</label>
                  <input
                    id={`qty-${selectedProduct.id}`}
                    type="number"
                    min={1}
                    value={quantities[selectedProduct.id] || 1}
                    onChange={e => handleQuantityChange(selectedProduct.id, e.target.value)}
                    className="w-16 border input-border-gray hover:border-gray-700 rounded px-2 py-0"
                  />
                </div>
                <div className="flex justify-center py-2 space-x-2">
                  <button
                            onClick={()=> AddProductToCart(selectedProduct, quantities[selectedProduct.id] || 1)}
                            className='bg-gray-400 text-white px-2 py-0 rounded cursor-pointer'
                        >
                            Add to Cart
                        </button>
                  <button
                            onClick={()=> handleWriteReview(selectedProduct)}
                            className='bg-blue-400 text-white px-2 py-0 rounded cursor-pointer'
                        >
                            Write Review
                        </button>
                  <button
                            onClick={()=> handleViewReviews(selectedProduct)}
                            className='bg-green-400 text-white px-2 py-0 rounded cursor-pointer'
                        >
                            View Reviews
                        </button>  
                </div>
              </>
            ) : (
              <div className="text-gray-500">Select a product to see details</div>
            )}
        </div>
      </div>

      {/* Review Modal */}
      <Modal
        opened={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        title="Write a Review"
        size="md"
      >
        {reviewProduct && (
          <Stack spacing="md">
            <div className="text-center">
              <img
                src={reviewProduct.image}
                alt={reviewProduct.product_name}
                className="w-32 h-32 object-contain mx-auto mb-4 rounded"
              />
              <Text size="lg" weight={500}>{reviewProduct.product_name}</Text>
            </div>
            
            <div>
              <Text size="sm" weight={500} mb="xs">Rating *</Text>
              <Rating value={rating} onChange={setRating} size="lg" />
            </div>
            
            <div>
              <Text size="sm" weight={500} mb="xs">Review (Optional)</Text>
              <Textarea
                value={reviewText}
                onChange={(event) => setReviewText(event.currentTarget.value)}
                placeholder="Share your experience with this product..."
                minRows={4}
                maxRows={6}
              />
            </div>
            
            <Group position="right" mt="md">
              <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                onClick={saveProductReview}
                disabled={rating === 0}
              >
                Submit Review
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Reviews Display Modal */}
      <Modal
        opened={reviewsModalOpen}
        onClose={() => setReviewsModalOpen(false)}
        title="Product Reviews"
        size="lg"
      >
        {selectedProductForReviews && (
          <Stack spacing="md">
            <div className="text-center">
              <img
                src={selectedProductForReviews.image}
                alt={selectedProductForReviews.product_name}
                className="w-32 h-32 object-contain mx-auto mb-4 rounded"
              />
              <Text size="lg" weight={500}>{selectedProductForReviews.product_name}</Text>
            </div>
            
            <div>
              {productReviews[selectedProductForReviews.id] && productReviews[selectedProductForReviews.id].length > 0 ? (
                <div className="space-y-4">
                  {productReviews[selectedProductForReviews.id].map((review, index) => (
                    <div key={index} className="border rounded p-4">
                      <div className="flex items-center justify-between mb-2">
                        <Text weight={500}>{review.user?.name || 'Anonymous'}</Text>
                        <Rating value={review.rating} readOnly size="sm" />
                      </div>
                      {review.review && (
                        <Text size="sm" color="dimmed">{review.review}</Text>
                      )}
                      <Text size="xs" color="dimmed" mt="xs">
                        {new Date(review.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                  ))}
                </div>
              ) : (
                <Text color="dimmed" align="center">No reviews yet. Be the first to review this product!</Text>
              )}
            </div>
            
            <Group position="center" mt="md">
              <Button 
                onClick={() => {
                  setReviewsModalOpen(false);
                  setReviewProduct(selectedProductForReviews);
                  setReviewModalOpen(true);
                }}
              >
                Write a Review
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>
    </>
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
