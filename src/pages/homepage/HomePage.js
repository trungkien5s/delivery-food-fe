import Layout from "../../components/layout/Layout"
import HeroSection from "../../components/sections/HeroSections"
import NewShop from "../../components/sections/NewShop"
import ProductCategories from "../../components/sections/ProductCategories"
import PromotionalBanners from "../../components/sections/PromotionalBanners"
import MeatProductsSection from "../../components/sections/MeatProductsSection"
import SpecialDealsSection from "../../components/sections/SpecialDealsSection"

export default function HomePage() {
  return (
    <Layout>
      <HeroSection />
      {/* <ProductCategories /> */}
      <NewShop />
      <SpecialDealsSection />  
      <MeatProductsSection />
      <PromotionalBanners />
      
    </Layout>
  )
}