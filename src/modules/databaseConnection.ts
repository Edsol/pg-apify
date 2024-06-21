import { Client, ConnectionConfig } from 'pg';

export default class DatabaseConnection {
    client;
    options: ConnectionConfig;

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