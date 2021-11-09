import {db, OptTransaction} from '../db'

export interface User {
    id: number
}

export interface UserInfo {
    id: number;
    name: string;
    email: string;
    password: string;
    activation_token: string;
    created_at: string;
    updated_at: string;
    bio: string;
    avatar: string;
    mobile: string;
    last_login: string;
    oidc_provider: string;
    oidc_id: string;
}

/**
 * Retrieve the user information from the database based on a user ID
 * @param trx - Active transaction details
 * @param id - User ID for which to get the details
 */
const getUserInfo = async (trx: OptTransaction, id: number | string): Promise<UserInfo | null> => {
    const _db = trx ? trx : db

    const rows = await _db
        .select()
        .from('users')
        .where('id', id)

    if (rows.length) {
        return rows[0]
    }

    return null
}

export {
    getUserInfo,
}
