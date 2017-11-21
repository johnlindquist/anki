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
import * as DF from "date-fns"

const log = R.bind(console.log, console)
const tapLog = R.tap(log)
import DebugDeck from "../components/debugDeck"
import Answer from "../components/answer"
import Question from "../components/question"

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
)
  .map(R.objOf("isFlipped"))
  .startWith({ isFlipped: false })

const findBy = R.compose(L.find, R.whereEq)

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
    L.filter(card => {
      return (
        DF.compareAsc(
          DF.startOfToday(),
          new Date(card.date)
        ) > -1
      )
    })
  ])

const makeCardLens = deckLens => {
  return [
    deckLens,
    L.find(card => {
      const result = DF.compareAsc(
        DF.startOfToday(),
        new Date(card.date)
      )
      return result == 1
    })
  ]
}

const hasDecks = L.get(["decks", "length"])

const gradeCard = (card, cardLens) => grade =>
  onAnswer({
    grade,
    card,
    cardLens
  })

const prepareProps = (props, state) => {
  const deckName = getDeck(props)
  const graded = L.get("graded", props)

  const deckLens = makeDeckLens(deckName)
  const dealtLens = makeDealtLens(deckName)
  const cardLens = makeCardLens(deckLens)

  const deck = L.get(deckLens, state)
  const dealt = L.get(dealtLens, state)

  const remaining = R.differenceWith(
    R.eqProps("id"),
    dealt,
    graded
  )

  const card = remaining[0]

  const grade = gradeCard(card, cardLens)

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

const graded$ = onAnswer$
  .pluck("card")
  .startWith({ graded: [] })
  .scan(R.flip(L.set(["graded", L.append])))
  .do(log)

const local$ = Observable.combineLatest(
  flipper$,
  graded$
).map(R.mergeAll)

const mapStream = mapPropsStream(props$ =>
  props$
    .filter(getDeck)
    .combineLatest(local$, R.merge)
    .combineLatest(store$.filter(hasDecks), prepareProps)
    .finally(shutdown)
)

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
      <Link href={{ pathname: "/summary" }}>
        <a>Summary</a>
      </Link>
      <hr />
      <div className="card">
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
      </div>

      <DebugDeck deck={deck} card={card} />
    </div>
  )
}

export default mapStream(QuizComponent)
