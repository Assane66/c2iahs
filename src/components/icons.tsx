
import type { SVGProps } from "react"
import Image from "next/image"

export const Icons = {
  logo: (props: SVGProps<SVGSVGElement>) => (
    <Image src="https://res.cloudinary.com/dm6yuokre/image/upload/v1759773957/logo_iiahs_vflfla.png" alt="Logo" width={48} height={48} />
  ),
}
