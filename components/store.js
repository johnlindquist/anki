import { BehaviorSubject, Observable } from "rxjs"
import { compose, identity, isArrayLike, bind } from "ramda"
import { set } from "partial.lenses"
import { request } from "universal-rxjs-ajax"

const DATA_URL = "https://anki-data.johnlindquist.com/decks"

const state = {
  deck: "redux",
  decks: [],
  current: 0,
  isFlipped: false
}

const storeDecks = compose(set("decks"), identity)

const decks$ = request({
  url: DATA_URL,
  method: "GET"
}).pluck("response")

export const store$ = new BehaviorSubject(state)
  .scan((state, fn) => {
    console.log({ state, fn })
    return fn(state)
  })
  .distinctUntilChanged()
  .do(state => console.log({ state }))
  .shareReplay(1)

const storeNext = bind(store$.next, store$)

export const run = streams =>
  Observable.merge(...streams).subscribe(storeNext)

run([decks$.map(storeDecks)])
