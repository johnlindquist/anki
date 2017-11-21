import { store$ } from "../components/store"
import Head from "../components/head"
import Link from "next/link"
import { mapPropsStream } from "recompose"
import * as R from "ramda"
import * as L from "partial.lenses"
import DebugDeck from "../components/debugDeck"

const getDeckLens = L.get([
  "decks",
  L.find(R.whereEq({ name: "redux" })),
  "cards"
])

const hasDecks = L.get(["decks", "length"])

const prepareProps = (props, state) => {
  const deck = getDeckLens(state)
  return {
    ...props,
    deck
  }
}

const stream$ = mapPropsStream(props$ =>
  props$.combineLatest(
    store$.filter(hasDecks),
    prepareProps
  )
)

const Page = ({ deck }) => (
  <div>
    <Head />
    <Link href={{ pathname: "/" }}>
      <a>Home</a>
    </Link>
    <Link
      href={{ pathname: "/quiz", query: { deck: "redux" } }}
    >
      <a>Redux</a>
    </Link>
    <DebugDeck deck={deck} />
  </div>
)

export default stream$(Page)
