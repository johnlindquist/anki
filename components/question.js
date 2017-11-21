export default ({ question, onFlip }) => (
  <div style={{ height: "18rem" }} className="card-body">
    <h2>{question}</h2>
    <div className="card-footer">
      <button
        className="background-success"
        onClick={onFlip}
      >
        Flip
      </button>
    </div>
  </div>
)
