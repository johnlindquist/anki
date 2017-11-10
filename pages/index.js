console.clear()
import {
  mapPropsStream,
  setObservableConfig,
  createEventHandler
} from "recompose"
import config from "recompose/rxjsObservableConfig"
import { Observable } from "rxjs/Observable"
import { request } from "universal-rxjs-ajax"

setObservableConfig(config)

const DATA_URL = "https://anki-data-tlwgdmrzkr.now.sh/cards"

const anki = mapPropsStream(props$ => {
  const {
    handler: onFlip,
    stream: onFlip$
  } = createEventHandler()

  const {
    handler: onNext,
    stream: onNext$
  } = createEventHandler()

  const current$ = onNext$
    .mapTo(1)
    .scan((acc, curr) => acc + curr)
    .startWith(0)

  const flip$ = onFlip$
    .mapTo(true)
    .merge(current$.mapTo(false))
    .startWith(false)

  const card = url =>
    request({ url, method: "GET" })
      .pluck("response")
      .combineLatest(current$, (cards, i) => {
        console.log({ cards, i })
        return cards[i]
      })
      .do(console.log.bind(console))
      .startWith({
        slug: "",
        question: "",
        answer: ""
      })

  return Observable.combineLatest(
    props$,
    card(DATA_URL),
    flip$,
    (props, card, isFlipped) => ({
      ...props,
      card,
      isFlipped,
      onFlip,
      onNext
    })
  )
})

export default anki(
  ({ card, onFlip, onNext, isFlipped }) => (
    <div>
      {isFlipped ? (
        <div>
          <div>{card.answer}</div>
          <button onClick={onNext}>Fail</button>
          <button onClick={onNext}>Hard</button>
          <button onClick={onNext}>Good</button>
          <button onClick={onNext}>Easy</button>
        </div>
      ) : (
        <div>
          <div>{card.question}</div>

          <button onClick={onFlip}>Flip</button>
        </div>
      )}
    </div>
  )
)
