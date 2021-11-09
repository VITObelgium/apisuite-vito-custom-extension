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

/**
 * Link a user as the organisation owner to an existing organisation
 * @param trx - Active transaction details
 * @param orgId - ID of the organisation to update
 * @param userId - User ID of the new owner for the organisation
 */
const linkOrganisationToUser = async (trx: OptTransaction, orgId: number, userId: number): Promise<void> => {
    const _db = trx ? trx : db
    await _db('user_organization')
        .insert({
            'user_id': userId,
            'org_id': orgId,
            'role_id': 4,
            'current_org': true,
            'created_at': new Date().toISOString(),
            'updated_at': new Date().toISOString(),
        })
}

export {
    update,
    getAddress,
    linkOrganisationToUser,
}
