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
 * Retrieve the role id from the database based on its name
 * @param trx - Active transaction details
 * @param name - Name of the role
 */
const getRoleID = async (trx: OptTransaction, name: string): Promise<number | null> => {
    const _db = trx ? trx : db

    const rows = await _db
        .select('id')
        .from('role')
        .where('name', name)

    if (rows.length) {
        return rows[0].id
    }
    return null
}


/**
 * Link a user to an existing organisation
 * @param trx - Active transaction details
 * @param orgId - ID of the organisation to update
 * @param userId - User ID of the new owner for the organisation
 * @param roleId - ID of the role to assign to the user
 */
const linkUserToOrganisation = async (trx: OptTransaction, orgId: number, userId: number, roleId: number): Promise<void> => {
    const _db = trx ? trx : db

    await _db('user_organization')
        .insert({
            'user_id': userId,
            'org_id': orgId,
            'role_id': roleId,
            'current_org': true,
            'created_at': new Date().toISOString(),
            'updated_at': new Date().toISOString(),
        })
}

export {
    update,
    getAddress,
    getRoleID,
    linkUserToOrganisation,
}
