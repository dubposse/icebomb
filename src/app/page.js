import Hero from "@/components/Hero";
import ProductBrowser from "@/components/ProductBrowser";
import ProductTicker from "@/components/ProductTicker";

export default function Home() {
  return (
    <>
      <ProductTicker />
      <Hero />
      <ProductBrowser />
    </>
  );
}
