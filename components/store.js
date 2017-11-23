import { BehaviorSubject, Observable, Subject } from "rxjs"
import * as R from "ramda"
import * as L from "partial.lenses"
import { request } from "universal-rxjs-ajax"
import { createEventHandler } from "recompose"
const log = R.bind(console.log, console)

const {
  handler: ajax,
  stream: onAjax$
} = createEventHandler()

const ajax$ = onAjax$
  .do(log)
  .mergeMap(({ url, method, resLens, body }) =>
    request({
      url: `${ENDPOINT}${url}`,
      method,
      body
    })
      .pluck("response")
      .map(resLens)
  )

const makeHttpService = ajax => ({
  get: (url, resLens) => {
    log({ url, resLens })
    return ajax({ method: "GET", url, resLens })
  },

  patch: (url, body, resLens) => {
    log({ url, body })
    return ajax({
      method: "PATCH",
      url,
      body,
      resLens
    })
  }
})

const http = makeHttpService(ajax)

const ENDPOINT = "http://localhost:3002/"

const state = {
  decks: [],
  cards: []
}

// const decks$ = request({
//   url: `${ENDPOINT}decks`,
//   method: "GET"
// })
//   .pluck("response")
//   .map(R.objOf("decks"))

// const cards$ = request({
//   url: `${ENDPOINT}cards`,
//   method: "GET"
// })
//   .pluck("response")
//   .map(R.objOf("cards"))

// const loadedData$ = Observable.zip(decks$, cards$)
//   .map(R.mergeAll)
//   .map(data => state => ({ ...state, ...data }))

export const dispatcher$ = new Subject()

export const store$ = new BehaviorSubject(state)
  .merge(dispatcher$, ajax$)
  .do(log)
  .scan((state, fn) => fn(state))
  .shareReplay(1)
  .do(state => console.log({ state }))

export const updateCard = ({ deckName, card }) => {
  const url = `cards/${card.id}`
  const body = card
  const lens = c =>
    L.assign(["cards", L.find(R.whereEq({ id: c.id }))], c)

  http.patch(url, body, lens)
}

setTimeout(() => {
  http.get("decks", res => state => ({
    ...state,
    decks: res
  }))
  http.get("cards", res => state => ({
    ...state,
    cards: res
  }))
}, 3000)
