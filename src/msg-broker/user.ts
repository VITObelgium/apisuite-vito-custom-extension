import { db } from '../db'
import { getUserInfo, User, UserInfo } from '../models/user'
import { linkOrganisationToUser, Organization } from '../models/organization'
import { createOrganisation, deleteOrganisation } from '../apisuite'
import log from '../log'


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

        // Update organisation to set the user as organisation owner
        await linkOrganisationToUser(trx, organisation.id, user.id)

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
