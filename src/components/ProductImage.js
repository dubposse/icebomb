import IceArt from "./IceArt";
import { getCategory } from "@/data/categories";

export default function ProductImage({ product, large = false }) {
  const cat = getCategory(product.category);
  return (
    <div
      className={`product-image${large ? " product-image--large" : ""}`}
      style={{ "--cat": cat?.color }}
    >
      {product.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={product.imageUrl} alt={`${product.name}`} />
      ) : (
        <IceArt category={product.category} color={product.color ?? cat?.color} />
      )}
    </div>
  );
}
