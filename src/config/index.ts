import { cleanEnv, port, str } from "envalid";

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ["development", "production"],
        default: "development",
    }),
    PORT: port({ default: 3000 }),
    API_URI: str({
        default: "http://localhost:3000/api",
    }),
    SOCKET_URI: str({
        default: "http://localhost:3000/socket",
    }),
    APP_VERSION: str({
        default: "1.0.0",
    }),
});

export default env;
