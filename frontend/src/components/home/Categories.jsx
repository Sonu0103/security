import { useNavigate } from "react-router-dom";

const categories = [
  {
    id: "bats",
    name: "Cricket Bats",
    image: "/images/hero1.jpg",
    description: "Professional grade cricket bats",
  },
  {
    id: "balls",
    name: "Cricket Balls",
    image: "/images/hero2.jpg",
    description: "Match and practice balls",
  },
  {
    id: "kits",
    name: "Cricket Kits",
    image: "/images/hero2.jpg",
    description: "Complete cricket gear sets",
  },
  {
    id: "accessories",
    name: "Accessories",
    image: "/images/hero1.jpg",
    description: "Essential cricket accessories",
  },
];

function Categories() {
  const navigate = useNavigate();

  return (
    <section id="categories" className="py-16 bg-neutral-lightGray">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-neutral-darkGray mb-12 text-center">
          Shop by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-neutral-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow"
            >
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <h3 className="text-xl font-semibold text-neutral-darkGray mb-2">
                  {category.name}
                </h3>
                <p className="text-gray-600 mb-4">{category.description}</p>
                <button
                  onClick={() => navigate(`/product/${category.id}`)}
                  className="w-full bg-primary-blue text-white py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Explore
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Categories;
