export const schema = {
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV',
    },
    logLevel: {
        doc: 'Logger verbosity level',
        format: String,
        default: 'debug',
        env: 'LOG_LEVEL',
    },
    dbURI: {
        doc: 'Database connection string',
        format: String,
        default: 'postgresql://dbuser:secretpassword@database.server.com:3211/mydb',
        env: 'DB_URI',
    },
    knexDebug: {
        doc: 'Knex.js debug flag (https://knexjs.org/#Builder-debug)',
        format: Boolean,
        default: false,
        env: 'KNEX_DEBUG',
    },
    etlURL: {
        doc: 'ETL API URL',
        format: String,
        default: 'https://etl.proba-v-mep.esa.int',
        env: 'ETL_API_URL',
    },
    apisuite: {
        url: {
            doc: 'APISuite API URL',
            format: String,
            default: 'https://apisuite-dev.proba-v-mep.esa.int',
            env: 'APISUITE_URL',
        },
        apiKey: {
            doc: 'APISuite API KEY',
            format: String,
            default: '',
            env: 'APISUITE_API_KEY',
        },
    },
    billing: {
        url: {
            doc: 'APISuite Billing API URL',
            format: String,
            default: 'https://billing-dev.proba-v-mep.esa.int',
            env: 'APISUITE_BILLING_URL',
        },
        defaultCredits: {
            doc: 'Default organisation credits',
            format: Number,
            default: 1000,
            env: 'APISUITE_BILLING_ORG_CREDITS',
        },
    },
    msgBroker: {
        url: {
            doc: 'APISuite Message Broker URL',
            format: String,
            default: 'amqp://mquser:mqpwd@localhost:5672',
            env: 'MSG_BROKER_URL',
        },
        eventsExchange: {
            doc: 'APISuite Message Broker Events Exchange name',
            format: String,
            default: 'apisuite_events',
            env: 'RABBITMQ_EVENTS_EXCHANGE',
        },
        queue: {
            doc: 'APISuite Message Broker Events Queue',
            format: String,
            default: 'custom-ext',
            env: 'RABBITMQ_QUEUE',
        },
    },
    features: {
        defaultLabel: {
            doc: 'Default label to add to all newly created services',
            format: String,
            default: 'prototype',
            env: 'FEAT_DEFAULT_LABEL',
        },
    },
}
