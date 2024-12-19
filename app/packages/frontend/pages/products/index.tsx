import React from "react";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";

type Product = {
  id: string;
  name: string;
  priceCents: number;
};

const fetchProducts = async () => {
  try {
    // In development, we'll use an environment variable to handle different environments
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

    const response = await fetch(`${API_URL}/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

const ProductItem: React.FC<{ products: Product[] }> = ({ products }) => {
  return (
    <div className="flex flex-col gap-y-2 w-full items-center">
      {products.map((product) => (
        <div
          className={classNames(
            "flex items-center justify-between w-1/2 p-4 my-4 bg-white shadow-lg rounded-lg"
          )}
        >
          <div>
            <h2 className={classNames("text-xl font-bold text-blue-600")}>
              {product.name}
            </h2>
            <p className="text-gray-500">${product.priceCents / 100}</p>
          </div>
          <button
            className={classNames(
              "px-4 py-2 text-white bg-blue-600 rounded-lg",
              "hover:bg-blue-400"
            )}
          >
            Add to Cart
          </button>
        </div>
      ))}
    </div>
  );
};

const ProductsPage: React.FC = () => {
  const { data, isLoading, error } = useQuery<{ products: Product[] }>({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });

  if (isLoading) {
    return <div className="text-center mt-10">Loading products...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        Error: {(error as Error).message}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-blue-600 mb-8">Our Products</h1>
      {data ? (
        <ProductItem products={data.products} />
      ) : (
        <div>No product found</div>
      )}
    </div>
  );
};

export default ProductsPage;
