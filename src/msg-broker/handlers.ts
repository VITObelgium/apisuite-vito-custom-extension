import config from '../config'
import { App, update } from '../models/app'

export const handleAppCreate = async (app: App): Promise<void> => {
  const appLabels = app.labels || []
  const defaultLabel = config.get('features.defaultLabel')
  await update(null, app.id, {
    labels: appLabels.includes(defaultLabel) ? appLabels : appLabels.concat(defaultLabel),
  })
}