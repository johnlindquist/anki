console.clear()
import Head from "../components/head"
import Link from "next/link"
import {
  mapPropsStream,
  createEventHandler
} from "recompose"

import { Observable } from "rxjs/Observable"
import { request } from "universal-rxjs-ajax"

import * as L from "partial.lenses"
import {
  get,
  set,
  elems,
  index,
  modify,
  find,
  prop,
  pick,
  lazy,
  choose,
  lens
} from "partial.lenses"
import {
  T,
  F,
  converge,
  compose,
  inc,
  always,
  identity,
  bind,
  transduce,
  juxt,
  whereEq,
  nthArg,
  merge
} from "ramda"

import supermemo from "../utils/supermemo"

//

console.log(supermemo(5)) //"b"

import { store$, run } from "../components/store"

const log = bind(console.log, console)

const {
  handler: onFlip,
  stream: onFlip$
} = createEventHandler()

const {
  handler: onNoIdea,
  stream: onNoIdea$
} = createEventHandler()

const {
  handler: onMaybe,
  stream: onMaybe$
} = createEventHandler()

const {
  handler: onTooEasy,
  stream: onTooEasy$
} = createEventHandler()

const findBy = compose(find, whereEq)

const flip = compose(set("isFlipped"), T)
const unflip = compose(set("isFlipped"), F)
const next = compose(modify("current"), always(inc))

const noIdea = compose(
  L.assign(
    choose(state => [
      "decks",
      findBy({ name: get("deck", state) }),
      "cards",
      findBy({ id: get("current", state) })
    ])
  ),
  always(supermemo(5))
)

const eventMap = [
  onFlip$.map(flip),
  onNoIdea$
    .withLatestFrom(store$, nthArg(1))
    .map(converge(compose, [next, unflip, noIdea])),
  onMaybe$.map(converge(compose, [next, unflip])),
  onTooEasy$.map(converge(compose, [next, unflip]))
]

const shutdown = run(eventMap)

const handlers = {
  onNoIdea,
  onMaybe,
  onTooEasy,
  onFlip
}

const anki = mapPropsStream(props$ =>
  props$
    .combineLatest(store$, (props, state) => ({
      ...props,
      state,
      handlers
    }))
    .finally(shutdown)
)

export default anki(props => {
  const state = get("state", props)
  console.log(state)
  const handlers = get("handlers", props)

  const current = get("current", state)
  const cards = get(
    ["decks", findBy({ name: "redux" }), "cards"],
    state
  )

  const currentCard = get(findBy({ id: current }), cards)

  const slug = get("slug", currentCard)
  const question = get("question", currentCard)
  const answer = get("answer", currentCard)
  const isFlipped = get("isFlipped", state)

  const onNext = get("onNext", handlers)
  const onFlip = get("onFlip", handlers)

  return (
    <div>
      <Head />
      <Link href={{ pathname: "/" }}>
        <a>Home</a>
      </Link>
      {!isFlipped ? (
        <div>
          <h2>{question}</h2>
          <button
            className="background-primary"
            onClick={onFlip}
          >
            Flip
          </button>
        </div>
      ) : (
        <div>
          <h3>{answer}</h3>
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
      )}
    </div>
  )
})
