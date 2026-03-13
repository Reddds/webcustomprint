const {
    defineConfig,
    globalIgnores,
} = require("eslint/config");

module.exports = defineConfig([{}, globalIgnores([
    "node_modules/@types/express-serve-static-core/*",
    "node_modules/@types/express-serve-static-core/index.d.ts",
])]);