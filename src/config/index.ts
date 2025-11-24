import { cleanEnv, port, str } from "envalid";

const env = cleanEnv(process.env, {
    NODE_ENV: str({
        choices: ["development", "production"],
        default: "development",
    }),
    PORT: port({ default: 3000 }),
    NEXT_PUBLIC_API_URL: str({
        default: "http://localhost:3000",
    }),
});

export default env;
