import convict from 'convict'
import { schema } from './schema'
import {config} from "dotenv";

config();
export default convict(schema)
