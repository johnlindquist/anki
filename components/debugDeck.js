import * as R from "ramda"

import {
  compareAsc,
  startOfToday,
  differenceInDays
} from "date-fns"

export default ({ deck }) => {
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
            style={{ width: "10rem" }}
            className={`card background-${{
              0: "danger",
              3: "warning",
              5: "success"
            }[card.grade]}`}
          >
            <div>Q: {card.question}</div>
            <div>Reps: {card.reps}</div>
            <div>Factor: {card.factor}</div>
            <div>Grade: {card.grade}</div>
            <div>Days until: {dayDifference}</div>
          </div>
        )
      }, deck)}
    </div>
  )
}
