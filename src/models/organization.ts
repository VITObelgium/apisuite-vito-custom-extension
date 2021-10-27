import { db, OptTransaction } from '../db'

export interface Organization {
  id: number
  name: string
  description: string
  taxExempt: boolean
  vat: string
  addressId: number
}

export type OrganizationUpdate = Partial<Organization>

export interface Address {
  id: number
  address: string
  postalCode: string
  city: string
  country: string
}

const update = async (trx: OptTransaction, id: number | string, org: OrganizationUpdate): Promise<Organization> => {
  const _db = trx ? trx : db

  const rows = await _db('organization')
    .update(org)
    .where('id', id)
    .returning('*')

  return rows[0]
}

const getAddress = async (trx: OptTransaction, id: number | string): Promise<Address | null> => {
  const _db = trx ? trx : db

  const rows = await _db
    .select()
    .from('address')
    .where('id', id)

  if (rows.length) {
    return rows[0]
  }

  return null
}

export {
  update,
  getAddress,
}
