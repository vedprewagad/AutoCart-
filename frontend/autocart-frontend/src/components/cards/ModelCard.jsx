import { getImageUrl as resolveImageUrl } from "../../utils/imageUrl";
import "./ModelCard.css";
import { useNavigate } from "react-router-dom";

function ModelCard({ model, onClick }) {
  const navigate = useNavigate();

  const getImageUrl = (url) => {
    let imgPath = url;
    if (!imgPath && model?.name) {
      const slug = model.name.toLowerCase().replace(/\s+/g, "_");
      imgPath = `/images/models/${slug}_exterior_1.png`;
    }
    return resolveImageUrl(imgPath);
  };

  const handleClick = () => {
    if (onClick) {
      onClick(model.id);
    } else {
      navigate(`/models/${model.id}`);
    }
  };

  return (
    <div className="model-card" onClick={handleClick}>
      <img src={getImageUrl(model.thumbnail)} alt={model.name} />

      <div className="model-info">
        <h3>{model.name}</h3>

        <span>{model.bodyType}</span>

        {model.startingPrice && (
          <h4>
            Starting at{" "}
            <strong>₹ {(model.startingPrice / 100000).toFixed(2)} Lakh</strong>
          </h4>
        )}
      </div>
    </div>
  );
}

export default ModelCard;
