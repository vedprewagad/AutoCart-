function PriceCard({ variant }) {
  const emi = Math.round(Number(variant.basePrice) / 60);

  return (
    <div className="price-card">
      <h2>₹ {(variant.basePrice / 100000).toFixed(2)} Lakh</h2>

      <p>EMI starts from ₹{emi.toLocaleString()}/month</p>

      <button>Book Now</button>
    </div>
  );
}

export default PriceCard;
