import config from '../config'
import fetch from 'node-fetch'
import log from '../log'
import { Organization } from '../models/organization'
import { BillingOrganization } from '../models/billingorganization'


/**
 * Create a new billing organisation through the billing API
 * @param org - Information of the organisation to add
 */
export const createBillingOrganisation = async (org: Organization): Promise<BillingOrganization | null> => {
    const url = new URL('/organizations', config.get('billing.url'))
    const body = JSON.stringify({
        id: org.id,
        credits: config.get('billing.defaultCredits'),
    })

    try {
        const response = await fetch(url.toString(), {
            method: 'POST',
            body,
        })
        if (!response || response.status !== 201) {
            return null
        }

        return (await response.json()).data as BillingOrganization
    } catch (err) {
        log.error(err, '[createBillingOrganisation]')
    }

    return null
}

/**
 * Assign the user's active billing organisation to a specific organisation
 * @param userId - User ID to update
 * @param orgId - Organisation ID to set as the active billing organisation
 */
export const assignBillingOrganisation = async (userId: number, orgId: number): Promise<number | null> => {
    const url = new URL(`/users/${userId}/organizations/${orgId}`, config.get('billing.url'))
    try {
        const response = await fetch(url.toString(), {
            method: 'PUT',
        })
        if (!response || response.status !== 204) {
            return null
        }

        return orgId
    } catch (err) {
        log.error(err, '[assignBillingOrganisation]')
    }

    return null
}
