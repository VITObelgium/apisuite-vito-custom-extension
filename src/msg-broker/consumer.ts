import amqplib from 'amqplib'
import log from '../log'
import { routingKeys } from './types'
import {
  handleOrgCreateUpdate,
  orgMetaToInternal,
  validateOrgMessage,
} from './organization'
import {
  handleAppCreate,
  validateAppMessage,
  appMetaToInternal,
} from './app'

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
    }
  } catch(err) {
    log.error(err, '[msg broker onMessage]')
  }
}
