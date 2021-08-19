# API Suite - VITO Custom Extension

This repository contains an extension to APISuite Core that provides specific functionalities in the context of VITO and the Terrascope marketplace.

## Functionality

- Listens for newly created services (applications) and adds a default (configurable) label to it;

## Configuration

Configuration is done through environment variables.
All variables are declared and documented in `src/config/schema.js`.

### Sample Configuration

Usually, at a minimum, these are the variables that need to be configured.

This ensures connectivity to the core's API and RabbitMQ instance, as well as proper CORS configuration to accept requests from the desired origin.
```
DB_URI=postgres://db_user:p4ssw0rd@dbserver:5432/marketplace_db 
MSG_BROKER_URL=amqp://apisuite:RW8zBFj2b3KAAwWr2xgu@apisuite-msg-broker:5672
RABBITMQ_EVENTS_EXCHANGE=apisuite_events_dev
RABBITMQ_QUEUE=custom-apps-queue
```
