export default ({
  answer,
  onNoIdea,
  onMaybe,
  onTooEasy
}) => (
  <div style={{ height: "18rem" }} className="card-body">
    <h3>{answer}</h3>

    <div className="card-footer">
      <button
        className="background-danger"
        onClick={onNoIdea}
      >
        😭 No idea
      </button>

      <button
        className="background-warning"
        onClick={onMaybe}
      >
        🤔 Maybe?
      </button>

      <button
        className="background-success"
        onClick={onTooEasy}
      >
        😁 Too easy!
      </button>
    </div>
  </div>
)
