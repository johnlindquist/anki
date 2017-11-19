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
import * as R from "ramda"

import supermemo from "../utils/supermemo"
import { store$, run } from "../components/store"
import { compareAsc, startOfToday } from "date-fns"

const log = R.bind(console.log, console)
const tapLog = R.tap(log)

const {
  handler: onFlip,
  stream: onFlip$
} = createEventHandler()

const {
  handler: onNoIdea,
  stream: onNoIdea$
} = createEventHandler()

const {
  handler: onAnswer,
  stream: onAnswer$
} = createEventHandler()

const {
  handler: onMaybe,
  stream: onMaybe$
} = createEventHandler()

const {
  handler: onTooEasy,
  stream: onTooEasy$
} = createEventHandler()

const findBy = R.compose(L.find, R.whereEq)
const flip = () => L.set("isFlipped", true)
const unflip = () => L.set("isFlipped", false)
const next = () => L.modify("current", R.inc)

const answer = ({ grade, cardLens }) =>
  L.modify(
    cardLens,
    R.converge(R.merge, [R.identity, supermemo(grade)])
  )

const eventMap = [
  onAnswer$.map(
    R.converge(R.compose, [next, unflip, answer])
  ),
  onFlip$.map(flip)
]

const shutdown = run(eventMap)

const handlers = {
  onNoIdea,
  onMaybe,
  onTooEasy,
  onFlip
}

const getCurrent = L.get(["state", "current"])
const getDeck = L.get(["url", "query", "deck"])
const hasDecks = L.get(["state", "decks", "length"])
const makeDeckLens = name =>
  L.choose(() => ["decks", findBy({ name }), "cards"])

const makeCardLens = (deckLens, id) => [
  deckLens,
  findBy({ id })
]

const makeNextCardLens = (deckLens, id) => [
  deckLens,
  L.find(
    card =>
      card.id > id && compareAsc(card.date, startOfToday())
  )
]

const anki = mapPropsStream(props$ =>
  props$
    .filter(getDeck)
    .combineLatest(store$, (props, state) => ({
      ...props,
      state,
      handlers
    }))
    .filter(hasDecks)
    .finally(shutdown)
)

export default anki(props => {
  const id = getCurrent(props)
  const name = getDeck(props)

  const deckLens = makeDeckLens(name)
  const cardLens = makeCardLens(deckLens, id)
  const nextLens = makeNextCardLens(deckLens, id)

  const deck = L.get(["state", deckLens], props)
  const card = L.get(["state", cardLens], props)
  const nextCard = L.get(["state", nextLens], props)

  const { question, answer } = card

  const isFlipped = L.get(["state", "isFlipped"], props)
  const { onNext, onFlip } = L.get("handlers", props)

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
            onClick={() =>
              onAnswer({
                grade: 0,
                deckLens,
                cardLens
              })}
          >
            😭 No idea
          </button>

          <button
            className="background-warning"
            onClick={() =>
              onAnswer({ grade: 3, lens: cardLens })}
          >
            🤔 Maybe?
          </button>

          <button
            className="background-success"
            onClick={() =>
              onAnswer({ grade: 5, lens: cardLens })}
          >
            😁 Too easy!
          </button>
        </div>
      )}
    </div>
  )
})
