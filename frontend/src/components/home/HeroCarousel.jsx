import { useState, useEffect } from "react";

const carouselItems = [
  {
    image: "/images/hero1.jpg",
    title: "Premium Cricket Bats",
    description: "Get 20% off on all premium cricket bats",
    buttonText: "Shop Now",
  },
  {
    image: "/images/hero2.jpg",
    title: "Professional Cricket Kits",
    description: "Complete kit for professional players",
    buttonText: "Explore",
  },
  {
    image: "/images/hero3.jpg",
    title: "New Season Collection",
    description: "Discover our latest cricket gear",
    buttonText: "View Collection",
  },
];

function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselItems.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="hero" className="relative h-[600px] overflow-hidden">
      {carouselItems.map((item, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-transform duration-500 ease-in-out ${
            index === currentSlide ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="absolute inset-0 bg-black/50" />
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-white">
            <h1 className="text-5xl font-bold mb-4">{item.title}</h1>
            <p className="text-xl mb-8">{item.description}</p>
            <button className="bg-accent-yellow text-neutral-darkGray px-8 py-3 rounded-full font-semibold hover:bg-accent-orange transition-colors">
              {item.buttonText}
            </button>
          </div>
        </div>
      ))}
      <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {carouselItems.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full ${
              index === currentSlide
                ? "bg-accent-yellow"
                : "bg-neutral-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroCarousel;
