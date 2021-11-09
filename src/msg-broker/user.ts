import { db } from '../db'
import { getUserInfo, User, UserInfo } from '../models/user'
import { Organization, updateAdminOrgOwner } from '../models/organization'
import { createOrganisation } from '../apisuite'
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

    try {
        // Get the user information based on the incoming message
        const userInfo: UserInfo | null = await getUserInfo(trx, user.id)
        if (!userInfo) {
            log.error(`Could not find user ${user.id}`)
            await trx.commit()
            return
        }

        // Create organisation based on the user's email address
        const organisation: Organization | null = await createOrganisation(`${userInfo.email}`)
        if (!organisation) {
            log.error(`Could not create organisation for user ${userInfo.id}`)
            await trx.commit()
            return
        }

        // Update organisation to set the user as organisation owner
        await updateAdminOrgOwner(trx, organisation.id, user.id)

        await trx.commit()
    } catch (err) {
        log.error(`Error when handling message for automatic creation of organisation for user ${user.id} - ${err}`)
        await trx.rollback()
    }
}
