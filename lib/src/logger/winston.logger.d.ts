import { LoggerService } from '@nestjs/common';
import { Logger } from 'winston';
export declare class WinstonLogger implements LoggerService {
    readonly logger: Logger;
    constructor(logger: Logger);
    log(message: any, context?: string): Logger;
    error(message: any, trace?: string, context?: string): any;
    warn(message: any, context?: string): any;
    debug(message: any, context?: string): any;
    verbose(message: any, context?: string): any;
}
