import { store$ } from "../components/store"
import Head from "../components/head"
import Link from "next/link"
import Nav from "../components/nav"
import { mapPropsStream } from "recompose"
import * as R from "ramda"
import * as L from "partial.lenses"

const stream$ = mapPropsStream(props$ =>
  props$.combineLatest(store$, (props, state) => {
    return {
      ...props,
      state
    }
  })
)

const displayDeckButtons = R.map(deck => {
  const name = L.get("name", deck)
  const id = L.get("id", deck)

  return (
    <Link
      key={id}
      href={{ pathname: "/quiz", query: { deck: name } }}
    >
      <a>{name}</a>
    </Link>
  )
})

const Page = props => {
  const state = L.get("state", props)
  const decks = L.get(["decks", L.defaults([])], state)
  return (
    <div>
      <Nav />
      <h1>Anki App</h1>
      {displayDeckButtons(decks)}
    </div>
  )
}

export default stream$(Page)
