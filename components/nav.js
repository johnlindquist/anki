import Head from "./head"
import Link from "next/link"

export default () => (
  <div>
    <Head />
    <Link href={{ pathname: "/" }}>
      <button>Home</button>
    </Link>
    <Link
      href={{ pathname: "/quiz", query: { deck: "redux" } }}
    >
      <button>Redux</button>
    </Link>
    <Link href={{ pathname: "/summary" }}>
      <button>Summary</button>
    </Link>
  </div>
)
