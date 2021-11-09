import config from '../config'
import fetch from 'node-fetch'
import log from '../log'

export interface VATCheck {
    vat: number
    exempt: boolean
}

export const getVatApplicable = async (vat: string, country: string): Promise<VATCheck | null> => {
    const url = new URL('/vat/applicable', config.get('etlURL'))
    url.searchParams.append('vat', vat)
    url.searchParams.append('iso', country)

    try {
        const response = await fetch(url.toString(), { method: 'GET' })
        if (!response || response.status !== 200) {
            return null
        }

        const data = await response.json() as VATCheck
        return {
            vat: data.vat,
            exempt: data.exempt,
        }
    } catch (err) {
        log.error(err, '[getVatApplicable]')
    }

    return null
}
