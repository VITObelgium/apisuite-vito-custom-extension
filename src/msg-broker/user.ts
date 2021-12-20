import { db } from '../db'
import { getUserInfo, User, UserInfo } from '../models/user'
import { getRoleID, linkUserToOrganisation, Organization } from '../models/organization'
import { createOrganisation, deleteOrganisation } from '../apisuite'
import log from '../log'
import { assignBillingOrganisation, createBillingOrganisation } from '../billing'
import { BillingOrganization } from '../models/billingorganization'


interface UserMessage {
    user_id: number
}

export const validateUserMessage = (msg: UserMessage): boolean => {
    return !!(msg && msg.user_id)
}

export const userMessageToInternal = (msg: UserMessage): User => ({
    id: Number(msg.user_id),
})

export const handleUserCreateOrgCreation = async (user: User): Promise<void> => {
    const trx = await db.transaction()
    let organisation: Organization | null = null

    try {
        // Get the user information based on the incoming message
        const userInfo: UserInfo | null = await getUserInfo(trx, user.id)
        if (!userInfo) {
            throw new Error(`Could not find user ${user.id}`)
        }

        // Create organisation based on the user's email address
        organisation = await createOrganisation(userInfo.email)
        if (!organisation) {
            throw new Error(`Could not create organisation for user ${userInfo.id}`)
        }

        // Retrieve the role ID for the organisation owner
        const roleId: number | null = await getRoleID(trx, 'organizationOwner')
        if (!roleId) {
            throw new Error('Could not find organizationOwner role ID')
        }

        // Update organisation to set the user as organisation owner
        await linkUserToOrganisation(trx, organisation.id, user.id, roleId)

        // Create billing organisation
        const billingOrganisation: BillingOrganization | null = await createBillingOrganisation(organisation)
        if (!billingOrganisation) {
            throw new Error(`Could not create billing organisation ${organisation.id}`)
        }

        // Set the user's billing organisation to the new organisation
        const orgId: number | null = await assignBillingOrganisation(user.id, organisation.id)
        if (!orgId) {
            throw new Error(`Could not set active billing organisation of user ${user.id} to ${organisation.id}`)
        }

        await trx.commit()
    } catch (err) {
        log.error(`Error when handling message for automatic creation of organisation for user ${user.id} - ${err}`)
        if (organisation) {
            log.debug(`Cleaning up organisation ${organisation.id}`)
            await deleteOrganisation(organisation.id)
        }
        await trx.rollback()
    }
}
