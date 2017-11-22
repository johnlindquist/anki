import { BehaviorSubject, Observable, Subject } from "rxjs"
import * as R from "ramda"
import * as L from "partial.lenses"
import { request } from "universal-rxjs-ajax"

const log = R.bind(console.log, console)

const ENDPOINT = "http://localhost:3002/"

const state = {
  decks: [],
  cards: []
}

const decks$ = request({
  url: `${ENDPOINT}decks`,
  method: "GET"
})
  .pluck("response")
  .map(R.objOf("decks"))

const cards$ = request({
  url: `${ENDPOINT}cards`,
  method: "GET"
})
  .pluck("response")
  .map(R.objOf("cards"))

const loadedData$ = Observable.zip(decks$, cards$)
  .map(R.mergeAll)
  .map(data => state => ({ ...state, ...data }))

export const dispatcher$ = new Subject()

//TODO: Refactor to `createEventHandler`
const putter$ = new Subject()
  .switchMap(({ deckName, card }) => {
    return request({
      url: `${ENDPOINT}cards/${card.id}`,
      method: "PATCH",
      body: card,
      dataType: "json",
      contentType: "application/json"
    })
  })
  .pluck("response")
  .map(card =>
    L.assign(
      ["cards", L.find(R.whereEq({ id: card.id }))],
      card
    )
  )

export const store$ = new BehaviorSubject(state)
  .merge(loadedData$, dispatcher$, putter$)
  .scan((state, fn) => fn(state))
  .shareReplay(1)
  .do(state => console.log({ state }))

export const updateCard = ({ deckName, card }) => {
  putter$.next({ deckName, card })
}
