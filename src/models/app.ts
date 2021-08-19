import { db, OptTransaction } from '../db'

export interface App {
  id: number
  name: string
  description: string
  shortDescription: string
  logo: string
  publisherId: number
  publisherName: string
  labels: string[]
}

export interface AppUpdate {
  name?: string
  description?: string
  shortDescription?: string
  labels?: string[]
}

const update = async (trx: OptTransaction, id: number | string, app: AppUpdate): Promise<App> => {
  const _db = trx ? trx : db

  const rows = await _db('app')
    .update(app)
    .where('id', id)
    .returning('*')

  return rows[0]
}

export {
  update,
}
