import { startOfToday, addDays, compareAsc } from "date-fns"

import * as R from "ramda"

const supermemo = grade => ({ factor = 0, reps = 0 }) => {
  const MAX_GRADE = 5

  //0 or 1: No idea..
  if (grade < 3) {
    return {
      grade,
      factor, //same factor
      reps: 0, //reset reps
      interval: 0, //reset interval
      date: startOfToday() //repeat today
    }
  }

  //2: Maybe?
  const calculatedFactor = +(factor +
    (0.1 -
      (MAX_GRADE - grade) *
        (0.08 + (MAX_GRADE - grade) * 0.02))
  ).toFixed(2)

  const newFactor =
    calculatedFactor > 1.3 ? calculatedFactor : 1.3

  const newReps = reps + 1
  if (grade == 3) {
    return {
      grade,
      factor: newFactor, //calculate factor
      reps: reps + 1, //increment reps
      interval: 0, //reset interval
      date: startOfToday() //repeat today
    }
  }

  //3: Too easy!
  const newInterval = ((reps, factor) => {
    if (reps == 1) return 1
    if (reps == 2) return 6
    return Math.ceil((reps - 1) * factor)
  })(newReps, newFactor)

  return {
    grade,
    factor: newFactor, //calculate factor
    reps: reps + 1, //increment reps
    interval: newInterval, //calculate interval
    date: addDays(startOfToday(), newInterval) //add interval to date
  }
}

export default R.curry(supermemo)
