import Layout from "../../components/layout/Layout"
import HeroSection from "../../components/sections/HeroSections"
import ProductCategories from "../../components/sections/ProductCategories"

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      <ProductCategories />
    </Layout>
  )
}