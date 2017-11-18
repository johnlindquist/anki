import { store$ } from "../components/store"
import Head from "../components/head"
import Link from "next/link"
import { mapPropsStream } from "recompose"
import { get, defaults } from "partial.lenses"
import { map } from "ramda"

const stream$ = mapPropsStream(props$ =>
  props$.combineLatest(store$, (props, state) => {
    return {
      ...props,
      state
    }
  })
)

const displayDeckButtons = map(deck => {
  const name = get("name", deck)
  const id = get("id", deck)

  return (
    <Link
      key={id}
      href={{ pathname: "/quiz", query: { name } }}
    >
      <a>{name}</a>
    </Link>
  )
})

const Page = props => {
  const state = get("state", props)
  console.log(state)
  const decks = get(["decks", defaults([])], state)
  return (
    <div>
      <Head />
      <button className="">Add Deck</button>
      <h1>Anki App</h1>
      {displayDeckButtons(decks)}
    </div>
  )
}

export default stream$(Page)
