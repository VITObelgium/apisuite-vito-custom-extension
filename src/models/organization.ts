import { db, OptTransaction } from '../db'
import config from '../config'

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

/**
 * Update the owner of an organisation that is created by the admin
 * @param trx - Active transaction details
 * @param orgId - ID of the organisation to update
 * @param ownerId - User ID of the new owner for the organisation
 */
const updateAdminOrgOwner = async (trx: OptTransaction, orgId: number, ownerId: number): Promise<void> => {
    const _db = trx ? trx : db
    await _db('user_organization')
        .update('user_id', ownerId)
        .update('current_org', 'true')
        .where('org_id', orgId)
        .andWhere('role_id', 4)
        .andWhere('user_id', config.get('apisuite.adminId'))
}

export {
    update,
    getAddress,
    updateAdminOrgOwner,
}
