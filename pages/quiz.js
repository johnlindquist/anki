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
import { store$, updateCard } from "../components/store"
import * as DF from "date-fns"

const log = R.bind(console.log, console)
const tapLog = R.tap(log)
import DebugDeck from "../components/debugDeck"
import Answer from "../components/answer"
import Question from "../components/question"
import Nav from "../components/nav"

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
const filterBy = R.compose(L.find, R.whereEq)

const onAnswerUnsub = onAnswer$.map(updateCard).subscribe()

const getDeck = L.get(["url", "query", "deck"])

const hasDecksAndCards = R.converge(R.and, [
  L.get(["decks", "length"]),
  L.get(["cards", "length"])
])

const gradeCard = (deckName, card) => grade =>
  onAnswer({
    grade,
    card: { ...card, ...supermemo(grade)(card) },
    deckName
  })

const prepareProps = (props, state) => {
  const graded = L.get("graded", props)

  const deckName = getDeck(props)
  const deck = L.get(
    ["decks", L.find(R.whereEq({ name: deckName }))],
    state
  )
  const deckId = L.get("id", deck)

  const cards = L.get(
    ["cards", L.filter(R.whereEq({ deckId }))],
    state
  )
  const dealt = L.get(
    [
      L.filter(card => {
        return (
          DF.compareAsc(
            DF.startOfToday(),
            new Date(card.date)
          ) > -1
        )
      })
    ],
    cards
  )

  const remaining = R.differenceWith(
    R.eqProps("id"),
    dealt,
    graded
  )

  const card = remaining[0]

  const grade = gradeCard(deckName, card)

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
    cards,
    card
  }
}

const graded$ = onAnswer$
  .pluck("card")
  .startWith({ graded: [] })
  .scan(R.flip(L.set(["graded", L.append])))

const local$ = Observable.combineLatest(
  flipper$,
  graded$
).map(R.mergeAll)

const mapStream = mapPropsStream(props$ =>
  props$
    .filter(getDeck)
    .combineLatest(local$, R.merge)
    .combineLatest(
      store$.filter(hasDecksAndCards),
      prepareProps
    )
)

const QuizComponent = ({
  deck,
  cards,
  card,
  isFlipped,
  onFlip,
  onNoIdea,
  onMaybe,
  onTooEasy
}) => {
  return (
    <div>
      <Nav />
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

      <DebugDeck cards={cards} card={card} />
    </div>
  )
}

export default mapStream(QuizComponent)
