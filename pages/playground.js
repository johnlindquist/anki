import * as L from "partial.lenses"
import * as R from "ramda"

const things = ["a", "b", "c"]
const selected = 1
const state = {
  things,
  selected
}

const setSelectedToNextB = R.converge(L.set("selected"), [
  L.get([
    "things",
    L.find(R.equals("b")),
    (value, index) => index
  ]),
  R.identity
])

const result = setSelectedToNextB(state)

console.log(result)

export default () => <div>Hi</div>
