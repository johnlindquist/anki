export default ({ question, onFlip }) => (
  <div style={{ height: "18rem" }}>
    <h2>{question}</h2>
    <div>
      <button
        className="background-success"
        onClick={onFlip}
      >
        Flip
      </button>
    </div>
  </div>
)
