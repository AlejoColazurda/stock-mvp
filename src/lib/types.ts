export type Access = {
  id: string
  name: string
  isAdmin: boolean
  canViewMovements: boolean
}

export type Product = {
  id: string
  sku: string | null
  name: string
  price: number
  stock: number
  minStock: number
  imageUrl: string
}
