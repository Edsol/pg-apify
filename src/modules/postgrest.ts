import { spawn, exec, ChildProcess } from 'child_process';
import * as util from 'util';
const execPromise = util.promisify(exec);

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';

// https://github.com/chimurai/http-proxy-middleware#readme
import { createProxyMiddleware } from 'http-proxy-middleware';
import { requestHandler, methodHandlers } from './handlers/request';
import { responseHandler } from './handlers/response';


const PROXY_PORT = process.env.PROXY_SERVER_PORT || 3000;

let postgrestProcess: ChildProcess | null = null;

const proxyServer = express();
// Middleware per il parsing del corpo delle richieste JSON
proxyServer.use(express.json());
proxyServer.listen(PROXY_PORT, () => { });

let verboseMode = false;

export type postgrestOptions = {
    /**
     * Flag to enable or disable postgREST.
     */
    enabled: true | false;

    /**
     * Flag to enable or disable documentation
     */
    enableDocs?: boolean,

    /**
     * Flag to enable or disable verbose mode to show logs 
     */
    verboseMode?: boolean,

    /**
     * The port number on which the server will run.
     */
    port: number | string,

    /**
     * Optional flag to enable or disable metrics.
     */
    metrics?: true | false
}


// Funzione per avviare PostgREST solo se non è già in esecuzione
export const runPostgrestServer = async (options: postgrestOptions) => {
    verboseMode = options.verboseMode || false;

    if (options.enableDocs || false) {
        docs();
    }
    subscribeHandlers();
    initProxy();

    const running = await isPostgrestRunning();
    // const address = `http://${process.env.PGRST_SERVER_HOST}:${process.env.PGRST_SERVER_PORT}`
    const port = options.port || 3000;
    const address = `http://localhost:${port}`;
    if (!running) {
        startPostgrest(options.verboseMode);

        console.log(`🔥 API is running at ${address}`)
    } else {
        spawn("killall", ["-SIGUSR2", "postgrest"]);
        console.log(`🔥 API is already running, reload it! ${address}`);
    }
};


const subscribeHandlers = () => {
    const methodsAndControllers = requestHandler.getMethodsAndControllersHavingCallbacks();

    for (const method in methodsAndControllers) {
        if (!methodHandlers[method]) {
            continue;
        }

        if (methodsAndControllers[method].size === 0) {
            proxyServer[method.toLowerCase()]("/:controller", async (req: Request, res: Response, next: NextFunction) => {
                const context = { req, res, next };
                const result = await methodHandlers[method](req, context, null);
                responseHandler(result, context);
            });
        }

        for (const controller of methodsAndControllers[method]) {
            const route = controller ? `/:controller(${controller})` : "/:controller";

            if (verboseMode) {
                console.log(`📌 RestAPI: Registering route for ${method} ${route}`);
            }

            proxyServer[method.toLowerCase()](route, async (req: Request, res: Response, next: NextFunction) => {
                const context = { req, res, next };
                const result = await methodHandlers[method](req, context, null, req.params.controller);
                responseHandler(result, context);
            });
        }
    }
}


const initProxy = () => {
    // Proxy per le API di PostgREST
    proxyServer.use('/', createProxyMiddleware({
        target: 'http://127.0.0.1:3001',
        changeOrigin: true,
        selfHandleResponse: false
    }));
}

const docs = () => {
    proxyServer.use('/docs', (req, res) => {
        res.sendFile(path.join(__dirname, '.', 'docs.html'));
    });
    console.log(`📖 API docs is running at http://localhost:${PROXY_PORT}/docs`);
}


// Funzione per avviare PostgREST
const startPostgrest = (verboseMode = false) => {
    postgrestProcess = spawn('postgrest');

    if (verboseMode || false) {
        postgrestProcess.stdout.on('data', (data: Buffer) => {
            console.log(`PostgREST stdout: ${data}`);
        });

        postgrestProcess.stderr.on('data', (data: Buffer) => {
            console.error(`PostgREST stderr: ${data}`);
        });

        postgrestProcess.on('close', (code: Buffer) => {
            console.log(`PostgREST process exited with code ${code}`);
            postgrestProcess = null; // Reset process variable on exit
        });
    }
};

// Funzione per fermare PostgREST
const stopPostgrest = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (!postgrestProcess) {
            resolve();
            return;
        }

        postgrestProcess.on('close', resolve);
        postgrestProcess.kill();
    });
};

// Funzione per controllare se PostgREST è già in esecuzione
const isPostgrestRunning = async (): Promise<boolean> => {
    try {
        const { stdout } = await execPromise('pgrep postgrest');
        return stdout.trim().length > 0;
    } catch (error) {
        return false;
    }
};

// Gestisci correttamente l'uscita del processo principale
const handleExit = async () => {
    await stopPostgrest();
    process.exit();
};

process.on('SIGINT', handleExit);
process.on('SIGTERM', handleExit);