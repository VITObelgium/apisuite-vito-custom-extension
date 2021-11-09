import config from '../config'
import fetch from 'node-fetch'
import log from '../log'
import { Organization } from '../models/organization'


/**
 * Create a new organisation through APISuite
 * @param name - Name of the organisation
 */
export const createOrganisation = async (name: string): Promise<Organization | null> => {
    const url = new URL('/organizations', config.get('apisuite.url'))
    const body = JSON.stringify({ name })

    try {
        const response = await fetch(url.toString(), {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${config.get('apisuite.apiKey')}`,
                'Content-Type': 'application/json',
            },
            body,
        })
        if (!response || response.status !== 201) {
            return null
        }

        return await response.json() as Organization
    } catch (err) {
        log.error(err, '[createOrganisation]')
    }

    return null
}
