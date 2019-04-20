"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const cosmiconfig = require("cosmiconfig");
function offsetFromRoot(fullPathToSourceDir) {
    const parts = core_1.normalize(fullPathToSourceDir).split('/');
    let offset = '';
    for (let i = 0; i < parts.length; ++i) {
        offset += '../';
    }
    return offset;
}
exports.offsetFromRoot = offsetFromRoot;
exports.DEFAULT_NRWL_PRETTIER_CONFIG = {
    singleQuote: true
};
function resolveUserExistingPrettierConfig() {
    const explorer = cosmiconfig('prettier', {
        sync: true,
        cache: false,
        rcExtensions: true,
        stopDir: process.cwd(),
        transform: result => {
            if (result && result.config) {
                delete result.config.$schema;
            }
            return result;
        }
    });
    return Promise.resolve(explorer.load(process.cwd())).then(result => {
        if (!result) {
            return null;
        }
        return {
            sourceFilepath: result.filepath,
            config: result.config
        };
    });
}
exports.resolveUserExistingPrettierConfig = resolveUserExistingPrettierConfig;
//# sourceMappingURL=common.js.map