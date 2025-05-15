// message, statusCode, error code, error

export class HttpException extends Error {
    message: string;
    errorCode: any;
    statusCode: number;
    error: any;

    constructor(message: string, statusCode: number, errorCode: any, error: any) {
        super(message);
        this.message = message;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.error = error;
    }
}

export enum ErrorCode {
    USER_NOT_FOUND = 1001,
    USER_ALREADY_EXIST = 1002,
    INCORRECT_PASSWORD = 1003
}
