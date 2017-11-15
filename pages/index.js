console.clear()
import {
  mapPropsStream,
  setObservableConfig,
  createEventHandler
} from "recompose"

import config from "recompose/rxjsObservableConfig"
import { Observable } from "rxjs/Observable"
import { request } from "universal-rxjs-ajax"
import { BehaviorSubject } from "rxjs/BehaviorSubject"

setObservableConfig(config)

const DATA_URL = "https://anki-data-tlwgdmrzkr.now.sh/cards"

const state = {
  cards: [],
  current: 0,
  message: "hello"
}
const store$ = new BehaviorSubject(
  state
).scan((state, fn) => fn(state))

const {
  handler: onChange,
  stream: onChange$
} = createEventHandler()

const {
  handler: onFlip,
  stream: onFlip$
} = createEventHandler()

const {
  handler: onNext,
  stream: onNext$
} = createEventHandler()

const cards$ = request({
  url: DATA_URL,
  method: "GET"
}).pluck("response")

const eventMap = [
  onChange$,
  onFlip$,
  onNext$.map(event => state => ({
    ...state,
    current: state.current + 1
  })),
  cards$.map(cards => state => ({ ...state, cards }))
]

store$.subscribe(console.log.bind(console))

Observable.merge(...eventMap).subscribe(store$)

const anki = mapPropsStream(props$ =>
  props$.combineLatest(store$, (props, state) => ({
    ...props,
    state,
    onNext
  }))
)

export default anki(
  ({ state, onFlip, onNext, onChange }) => (
    <div>
      <button onClick={onNext}>Next</button>
      <div>{state.current}</div>
      <div>
        {JSON.stringify(state.cards[state.current])}
      </div>
    </div>
  )
)
