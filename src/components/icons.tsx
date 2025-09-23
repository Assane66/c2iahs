
import type { SVGProps } from "react"
import { BookCopy } from "lucide-react"

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <BookCopy {...props} />
  ),
}
