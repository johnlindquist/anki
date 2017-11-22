import { store$ } from "../components/store"
import Head from "../components/head"
import Nav from "../components/nav"
import Link from "next/link"
import { mapPropsStream } from "recompose"
import * as R from "ramda"
import * as L from "partial.lenses"
import DebugDeck from "../components/debugDeck"

const hasDecks = L.get(["decks", "length"])

const prepareProps = (props, state) => {
  const cards = L.get([
    "cards",
    L.filter(R.whereEq({ deckId: 0 }))
  ])(state)
  return {
    ...props,
    cards
  }
}

const stream$ = mapPropsStream(props$ =>
  props$.combineLatest(
    store$.filter(hasDecks),
    prepareProps
  )
)

const Page = ({ cards }) => (
  <div>
    <Nav />
    <DebugDeck cards={cards} />
  </div>
)

export default stream$(Page)
