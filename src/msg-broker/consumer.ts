import amqplib from 'amqplib'
import log from '../log'
import { routingKeys } from './types'
import { handleOrgCreateUpdate, orgMetaToInternal, validateOrgMessage } from './organization'
import { appMetaToInternal, handleAppCreate, validateAppMessage } from './app'
import { handleUserCreateOrgCreation, userMessageToInternal, validateUserMessage } from './user'

export const onMessage = (data: amqplib.ConsumeMessage | null): void => {
    if (!data || !data.fields || !data.fields.routingKey) {
        log.error('invalid msg', '[msg broker onMessage]')
        return
    }

    try {
        const msg = JSON.parse(data.content.toString())
        switch (data.fields.routingKey) {
            case routingKeys.APP_CREATED: {
                if (!validateAppMessage(msg)) {
                    log.warn('could not update app', msg)
                    break
                }
                handleAppCreate(appMetaToInternal(msg.meta))
                    .catch((err) => log.error(err))
                break
            }
            case routingKeys.ORG_UPDATED:
            case routingKeys.ORG_CREATED: {
                if (!validateOrgMessage(msg)) {
                    log.warn('could not update organization', msg)
                    break
                }
                log.debug(msg)
                handleOrgCreateUpdate(orgMetaToInternal(msg.meta))
                    .catch((err) => log.error(err))
                break
            }
            case routingKeys.PYTHON_USER_CREATE_ORG:
            case routingKeys.USER_CREATED: {
                if (!validateUserMessage(msg)) {
                    log.warn('could not validate user message', msg)
                    break
                }
                handleUserCreateOrgCreation(userMessageToInternal(msg))
                    .catch((err) => log.error(err))
                break
            }
        }
    } catch (err) {
        log.error(err, '[msg broker onMessage]')
    }
}
