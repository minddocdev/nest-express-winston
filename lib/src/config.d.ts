export declare const env: Readonly<{
    ENVIRONMENT: string;
    LOG_LEVEL: string;
    VERSION: string;
}> & import("envalid").CleanEnv & {
    readonly [varName: string]: string | undefined;
};
export declare const isKubernetesEnv: boolean;
