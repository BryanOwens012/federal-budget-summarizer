import React from "react";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { UUID } from "crypto";

type Product = {
  id: UUID;
  name: string;
  priceCents: number;
  createdAt: string;
  updatedAt: string;
};

const fetchProducts = async (): Promise<Product[]> => {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) {
    throw new Error("API_URL environment variable is not set");
  }

  const response = await fetch(apiUrl);
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
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
  const { data, isLoading, error } = useQuery<Product[]>({
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
      {data ? <ProductItem products={data} /> : <div>No product found</div>}
    </div>
  );
};

export default ProductsPage;