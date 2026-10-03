import Catalog from '@/components/Catalog'
import { getProducts } from '@/actions/inventory'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  const result = await getProducts('')
  return <Catalog initialProducts={result.products} initialError={result.error} />
}
