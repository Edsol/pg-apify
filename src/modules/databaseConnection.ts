import { Client, type ConnectionConfig, type Client as ClientType } from 'pg';

export default class DatabaseConnection {
    client?: ClientType = undefined;
    options: ConnectionConfig = {};

    public set(options: ConnectionConfig) {
        this.options = options;
    }

    public async connect(verboseMode = false) {
        if (verboseMode) {
            console.log(this.options);
        }
        this.client = new Client(this.options);
        return this.client.connect();
    }
}