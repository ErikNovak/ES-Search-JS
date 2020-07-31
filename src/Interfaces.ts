export interface IGenericJSON { [key: string]: any; }
export type IGenericExecFunc = (value?: any) => any;
export type IGenericCallbackFunc = (error: Error, value?: any) => any;

/////////////////////////////////////////////////////////////////////
// Configurations
/////////////////////////////////////////////////////////////////////

export interface IConfigCommon {
    environment: string,
    isProduction: boolean
}

export interface IConfigENV {
    port: number,
    sessionsecret?: string,
    elasticsearch: {
        node: string,
        index: string
    }
}

export interface IConfiguration {
    environment?: string,
    isProduction?: boolean,
    port: number,
    sessionsecret?: string,
    elasticsearch: {
        node: string,
        index: string
    }
}

/////////////////////////////////////////////////////////////////////
// PostgreSQL Interfaces
/////////////////////////////////////////////////////////////////////

export interface IPostgreSQLParams {
    user: string;
    database: string;
    password: string;
    host: string;
    port: number;
    max: number;
    idleTimeoutMillis: number;
    schema: string;
    version: string;
}

export type IPostgreSQLBatchCallbackFunc = (error: Error, rows: any[], callback: IGenericCallbackFunc) => void;


/////////////////////////////////////////////////////////////////////
// Express API routes
/////////////////////////////////////////////////////////////////////

export interface ISearch {
    text?: string,
    limit?: number,
    page?: number
}

export interface IQueryElement {
    term?: object,
    terms?: object,
    regexp?: object,
    exists?: object,
    range?: object
}