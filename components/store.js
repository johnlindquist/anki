import { BehaviorSubject, Observable } from "rxjs"
import * as R from "ramda"
import * as L from "partial.lenses"
import { request } from "universal-rxjs-ajax"

const DATA_URL = "https://anki-data.johnlindquist.com/decks"

const state = {
  query: {
    deck: "redux"
  },
  decks: [],
  current: 0,
  isFlipped: false
}

const storeDecks = R.compose(L.set("decks"), R.identity)

const decks$ = request({
  url: DATA_URL,
  method: "GET"
}).pluck("response")

export const store$ = new BehaviorSubject(state)
  .scan((state, fn) => fn(state))
  // .distinctUntilChanged()
  .do(state => console.log({ state }))
  .shareReplay(1)

export const storeNext = R.bind(store$.next, store$)

export const run = streams =>
  Observable.merge(...streams).subscribe(storeNext)

run([decks$.map(storeDecks)])
