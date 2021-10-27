import { App, update } from '../models/app'
import config from '../config'

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

export const validateAppMessage = (msg: AppMessage): boolean => {
  return !!(msg && msg.app_id && msg.meta)
}

export const appMetaToInternal = (meta: AppMeta): App => ({
  id: Number(meta.id),
  name: meta.name,
  shortDescription: meta.shortDescription,
  description: meta.description,
  logo: meta.logo,
  publisherId: Number(meta.org.id),
  publisherName: meta.org.name,
  labels: meta.labels,
})

export const handleAppCreate = async (app: App): Promise<void> => {
  const appLabels = app.labels || []
  const defaultLabel = config.get('features.defaultLabel')
  await update(null, app.id, {
    labels: appLabels.includes(defaultLabel) ? appLabels : appLabels.concat(defaultLabel),
  })
}