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
import {
  compareAsc,
  startOfToday,
  differenceInDays
} from "date-fns"

const log = R.bind(console.log, console)
const tapLog = R.tap(log)

const {
  handler: onFlip,
  stream: onFlip$
} = createEventHandler()

const {
  handler: onAnswer,
  stream: onAnswer$
} = createEventHandler()

const flipper$ = Observable.merge(
  onFlip$.mapTo(true),
  onAnswer$.mapTo(false)
).startWith(false)

const findBy = R.compose(L.find, R.whereEq)
const next = () => L.modify("current", R.inc)

const answer = ({ grade, cardLens }) =>
  L.modify(
    cardLens,
    R.chain(R.flip(R.merge), supermemo(grade))
  )

const eventMap = [onAnswer$.map(answer)]

const shutdown = run(eventMap)

const getDeck = L.get(["url", "query", "deck"])
const makeDeckLens = name =>
  L.choose(() => ["decks", findBy({ name }), "cards"])

const makeDealtLens = name =>
  L.choose(() => [
    "decks",
    findBy({ name }),
    "cards",
    L.filter(
      card =>
        compareAsc(startOfToday(), new Date(card.date)) == 1
    )
  ])

const makeCardLens = deckLens => {
  return [
    deckLens,
    L.find(card => {
      const result = compareAsc(
        startOfToday(),
        new Date(card.date)
      )
      return result == 1
    })
  ]
}

const hasDecks = L.get(["decks", "length"])

const gradeCard = (deckLens, cardLens) => grade =>
  onAnswer({
    grade,
    deckLens,
    cardLens
  })

const prepareProps = (props, state) => {
  const deckName = getDeck(props)

  const deckLens = makeDeckLens(deckName)
  const dealtLens = makeDealtLens(deckName)
  const cardLens = makeCardLens(deckLens)

  const deck = L.get(deckLens, state)
  const dealt = L.get(dealtLens, state)
  const card = L.get(cardLens, state)

  const grade = gradeCard(deckLens, cardLens)

  const onNoIdea = () => grade(0)

  const onMaybe = () => grade(3)

  const onTooEasy = () => grade(5)

  return {
    ...props,
    onFlip,
    onNoIdea,
    onMaybe,
    onTooEasy,
    deck,
    card
  }
}

//const flipCard = (props, isFlipped) => ({...props, isFlipped})
const flipCard = R.flip(L.set("isFlipped"))

const mapStream = mapPropsStream(props$ =>
  props$
    .combineLatest(flipper$, flipCard)
    .filter(getDeck)
    .combineLatest(store$.filter(hasDecks), prepareProps)
    .finally(shutdown)
)

const Question = ({ question, onFlip }) => (
  <div>
    <button className="background-success" onClick={onFlip}>
      Flip
    </button>
    <h2>{question}</h2>
  </div>
)

const Answer = ({
  answer,
  onNoIdea,
  onMaybe,
  onTooEasy
}) => (
  <div>
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
    <h3>{answer}</h3>
  </div>
)

const DebugDeck = ({ deck, card: { id } }) => {
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
            className={`padding-large ${card.id == id
              ? "border border-primary"
              : ""}`}
            key={card.id}
          >
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

const QuizComponent = ({
  deck,
  card,
  isFlipped,
  onFlip,
  onNoIdea,
  onMaybe,
  onTooEasy
}) => {
  return (
    <div>
      <Head />
      <Link href={{ pathname: "/" }}>
        <a>Home</a>
      </Link>
      <hr />
      {!isFlipped ? (
        <Question
          question={card.question}
          onFlip={onFlip}
        />
      ) : (
        <Answer
          answer={card.answer}
          onNoIdea={onNoIdea}
          onMaybe={onMaybe}
          onTooEasy={onTooEasy}
        />
      )}

      <DebugDeck deck={deck} card={card} />
    </div>
  )
}

export default mapStream(QuizComponent)
