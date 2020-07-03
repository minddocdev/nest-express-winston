export declare const env: Readonly<{
    ENVIRONMENT: string;
    LOG_LEVEL: "debug" | "info" | "error" | "warn" | "help" | "data" | "prompt" | "http" | "verbose" | "input" | "silly";
    NODE_ENV: string;
    VERSION: "unknown";
}> & import("envalid").CleanEnv & {
    readonly [varName: string]: string | undefined;
};
export declare const isKubernetesEnv: boolean;
