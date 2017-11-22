import * as R from "ramda"
import * as L from "partial.lenses"

import {
  compareAsc,
  startOfToday,
  differenceInDays
} from "date-fns"

export default ({ cards, card }) => {
  const id = L.get("id", card)
  return (
    <div className="row">
      {R.map(card => {
        const difference = differenceInDays(
          new Date(card.date),
          startOfToday()
        )

        const dayDifference =
          difference < 0 ? 0 : difference
        return (
          <div
            key={card.id}
            style={{ width: "10rem" }}
            className={`col padding-small background-${{
              0: "danger",
              3: "warning",
              5: "success"
            }[card.grade]} ${id == card.id
              ? " border border-primary "
              : ""}`}
          >
            <div>Q: {card.question}</div>
            <div>Reps: {card.reps}</div>
            <div>Factor: {card.factor}</div>
            <div>Grade: {card.grade}</div>
            <div>Days until: {dayDifference}</div>
          </div>
        )
      }, cards)}
    </div>
  )
}
