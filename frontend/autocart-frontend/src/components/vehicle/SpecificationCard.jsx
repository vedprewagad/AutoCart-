import "./SpecificationCard.css";

function SpecificationCard({ title, value }) {
  return (
    <div className="spec-card">
      <span>{title}</span>

      <strong>{value}</strong>
    </div>
  );
}

export default SpecificationCard;
