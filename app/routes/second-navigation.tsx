import { xprisma } from "~/utils/prisma.server";
import type { Route } from "../+types/root";


export async function loader() {
  const descendants = await xprisma.folder.findDescendants({
    where: { path: '0001' },
    select: { path: true, name: true }
  })

  console.log('desc:,', descendants)

  return { descendants }

}

export default function SecondNavigation({ loaderData }: Route.ComponentProps) {
  const { descendants } = loaderData

  return (
    <div >{descendants.map((desc) => <div onClick={(e) => console.log(e)}>{desc.name}</div>)}</div>
  )
} 