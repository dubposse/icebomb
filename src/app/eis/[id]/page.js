import { Suspense } from "react";
import ProductDetail from "@/components/ProductDetail";

async function Detail({ params }) {
  const { id } = await params;
  return <ProductDetail id={id} />;
}

export default function ProductPage({ params }) {
  return (
    <Suspense fallback={<p className="empty">Lade Eis …</p>}>
      <Detail params={params} />
    </Suspense>
  );
}
