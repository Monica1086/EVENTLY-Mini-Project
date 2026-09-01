import FeaturedProducts from "../components/FeaturedProducts";
import Hero from "../components/Hero";
import Mitra from "../components/Mitra";
import Promo from "../components/Promo";
import Testimonials from "../components/Testimonials";
import WhyChooseUs from "../components/WhyChooseUs";



function Homepage() {
  return (
    <div>
    <Hero />
    <WhyChooseUs />
    <FeaturedProducts />
    <Promo />
    <Testimonials />
    <Mitra />
    
    </div>
  );
}

export default Homepage;