import amqplib from 'amqplib'
import log from '../log'
import { routingKeys } from './types'
import {
  handleAppCreate,
} from './handlers'
import { App } from '../models/app'

interface AppMeta {
  id: string
  name: string
  description: string
  shortDescription: string
  logo: string
  visibility: string
  state: string
  labels: string[]
  org: {
    id: string
    name: string
  }
}

interface AppMessage {
  app_id: string
  meta: AppMeta
}

const validateAppMessage = (msg: AppMessage): boolean => {
  return !!(msg && msg.app_id && msg.meta)
}

const appMetaToInternal = (meta: AppMeta): App => ({
  id: Number(meta.id),
  name: meta.name,
  shortDescription: meta.shortDescription,
  description: meta.description,
  logo: meta.logo,
  publisherId: Number(meta.org.id),
  publisherName: meta.org.name,
  labels: meta.labels,
})

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
        handleAppCreate(appMetaToInternal(msg.meta)).catch((err) => log.error(err))
        break
      }
    }
  } catch(err) {
    log.error(err, '[msg broker onMessage]')
  }
}
