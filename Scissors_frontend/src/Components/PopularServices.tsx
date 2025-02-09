
import { Scissors,Droplet , Palette, Smile, Star } from "lucide-react";

const PopularServices = () => {
    const services = [
        {
          name: "Haircut",
          icon: <Scissors size={36} />,
          description: "Style your hair with a professional touch.",
        },
        {
          name: "Spa",
          icon: <Droplet size={36} />,
          description: "Relax and rejuvenate with our soothing spa treatments.",
        },
        {
          name: "Manicure",
          icon: <Palette size={36} />,
          description: "Perfect your nails with our expert manicure services.",
        },
        {
          name: "Pedicure",
          icon: <Smile size={36} />,
          description: "Keep your feet healthy and beautiful with a pedicure.",
        },
        {
          name: "Hair Coloring",
          icon: <Star size={36} />,
          description: "Get vibrant hair colors that suit your style.",
        },
      ];
  
    return (
      <div className="py-16 bg-white">
        <h2 className="text-4xl font-bold text-center mb-8 text-black font-poppins">
          Popular Services
        </h2>
        <div className="flex flex-wrap justify-center gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white shadow-lg rounded-lg overflow-hidden transform hover:scale-105 transition duration-300 ease-in-out w-72 p-6 flex flex-col items-center text-center"
            >
              <div className="bg-white p-4  mb-4">
                {service.icon}
              </div>
              <span className="text-xl font-semibold text-gray-800">{service.name}</span>
              <p className="text-gray-600 mt-2">{service.description}</p>
              {/* <button className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">
                Book Now
              </button> */}
            </div>
          ))}
        </div>
      </div>
    );
  };
export default PopularServices
