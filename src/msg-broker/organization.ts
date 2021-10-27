import { db } from '../db'
import { getAlpha2Code } from 'i18n-iso-countries'
import { Organization, update, getAddress } from '../models/organization'
import { getVatApplicable } from '../etl'

interface OrganizationMeta {
  id: string
  name: string
  description: string
  vat: string
  addressId: string
}

interface OrgMessage {
  organization_id: string
  meta: OrganizationMeta
}

export const validateOrgMessage = (msg: OrgMessage): boolean => {
  return !!(msg && msg.organization_id && msg.meta)
}

export const orgMetaToInternal = (meta: OrganizationMeta): Organization => ({
  id: Number(meta.id),
  name: meta.name,
  description: meta.description,
  vat: meta.vat,
  taxExempt: false,
  addressId: Number(meta.addressId),
})

export const handleOrgCreateUpdate = async (org: Organization): Promise<void> => {
  if (!org.vat || !org.addressId) return

  const trx = await db.transaction()
  try {
    const address = await getAddress(trx, org.addressId)
    if (!address || !address.country) {
      await trx.commit()
      return
    }

    const countryCode = getAlpha2Code(address.country, "en")
    if (!countryCode) {
      await trx.commit()
      return
    }

    const vatApplicable = await getVatApplicable(org.vat, countryCode)
    if (vatApplicable) {
      await update(trx, org.id, {
        taxExempt: vatApplicable.exempt,
      })
    }

    await trx.commit()
  } catch (err) {
    await trx.rollback()
  }
}