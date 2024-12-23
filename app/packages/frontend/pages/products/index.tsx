import React from "react";
import { useQuery } from "@tanstack/react-query";
import classNames from "classnames";
import { ListProductsRow } from "@/db/products_sql";
import { apiURL, apiVersion } from "../_app";

type ProductsResponse = {
  products: ListProductsRow[];
};

const fetchProducts = async (): Promise<ProductsResponse> => {
  try {
    const response = await fetch(`${apiURL}/${apiVersion}/products`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};

type ProductItemProps = {
  products: ListProductsRow[];
};

const ProductItem: React.FC<ProductItemProps> = ({ products }) => {
  return (
    <div className="flex flex-col gap-y-2 w-full items-center">
      {products.map((product) => (
        <div
          key={product.id} // Add a key prop for React list rendering
          className={classNames(
            "flex items-center justify-between w-1/2 p-4 my-4 bg-white shadow-lg rounded-lg"
          )}
        >
          <div>
            <h2 className={classNames("text-xl font-bold text-blue-600")}>
              {product.name}
            </h2>
            <p className="text-gray-500">
              {product.pricecents == null
                ? "-"
                : "$" + product.pricecents / 100}
            </p>
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
  // Update the query to use the correct response type
  const { data, isLoading, error } = useQuery<ProductsResponse>({
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
