import IceArt from "./IceArt";
import { getCategory } from "@/data/categories";

export default function ProductImage({ product, large = false, thumb = false }) {
  const cat = getCategory(product.category);
  const src = (thumb && product.thumbUrl) || product.imageUrl;
  return (
    <div
      className={`product-image${large ? " product-image--large" : ""}`}
      style={{ "--cat": cat?.color }}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={`${product.name}`} loading={large ? "eager" : "lazy"} decoding="async" />
      ) : (
        <IceArt category={product.category} color={product.color ?? cat?.color} />
      )}
    </div>
  );
}
