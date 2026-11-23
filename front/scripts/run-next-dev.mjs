import { spawn } from "node:child_process";

const mode = process.argv[2] ?? "back";

const envByMode = {
  mock: {
    API_EVENTS_BASE: "http://127.0.0.1:4010",
    API_MOCK_BASE: "http://127.0.0.1:4010",
  },
  back: {
    API_EVENTS_BASE: "http://127.0.0.1:3000/api",
    API_MOCK_BASE: "http://127.0.0.1:4010",
  },
};

const selectedEnv = envByMode[mode] ?? envByMode.back;

const child = spawn("npx", ["next", "dev", "--port", "3001"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    ...selectedEnv,
  },
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});
