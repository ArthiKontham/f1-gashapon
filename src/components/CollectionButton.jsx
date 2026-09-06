import "./CollectionModal.css";
export default function CollectionButton({ onClick }) {
  return (
    <button className="collection-btn" onClick={onClick}>
      COLLECTION
    </button>
  );
}