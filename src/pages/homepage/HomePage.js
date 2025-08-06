import Layout from "../../components/layout/Layout"
import HeroSection from "../../components/sections/HeroSections"
import NewShop from "../../components/sections/NewShop"
import ProductCategories from "../../components/sections/ProductCategories"

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <ProductCategories />
      <NewShop />
    </Layout>
  )
}