

const SalonCard = ({ name, image, rating, comment }:any) => {
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 w-64 sm:w-72 md:w-80 transition-transform hover:scale-105">
      {/* Salon Image */}
      <div className="overflow-hidden rounded-lg mb-4">
        <img
          src={image}
          alt={name}
          className="w-full h-[200px] object-cover rounded-lg"
        />
      </div>

      {/* Salon Name */}
      <h3 className="text-xl font-bold mb-2">{name}</h3>

      {/* Rating */}
      <p className="text-yellow-500 mb-2">
        {Array(Math.round(rating))
          .fill('⭐')
          .join('')}
        ({rating} / 5)
      </p>

      {/* Comment */}
      <p className="text-sm text-gray-700">{comment}</p>
    </div>
  );
};

export default SalonCard;
