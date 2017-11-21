import { BehaviorSubject, Observable } from "rxjs"
import * as R from "ramda"
import * as L from "partial.lenses"
import { request } from "universal-rxjs-ajax"

const DATA_URL = "https://anki-data.johnlindquist.com/decks"

const state = {
  decks: []
}

const storeDecks = decks => L.set("decks", decks)

const decks$ = request({
  url: DATA_URL,
  method: "GET"
}).pluck("response")

export const store$ = new BehaviorSubject(state)
  .scan((state, fn) => fn(state))
  .distinctUntilChanged()
  .shareReplay(1)
  .do(state => console.log({ state }))

export const storeNext = R.bind(store$.next, store$)

export const run = streams =>
  Observable.merge(...streams).subscribe(storeNext)

run([decks$.map(storeDecks)])
