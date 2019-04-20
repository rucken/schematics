"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const schematics_1 = require("@angular-devkit/schematics");
const appRoot = require("app-root-path");
const prettier_1 = require("prettier");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
function formatFiles(options = { skipFormat: false }) {
    //Tree | Observable<Tree> | Rule {
    if (options.skipFormat) {
        return schematics_1.noop();
    }
    return (host, context) => {
        const files = new Set(host.actions
            .filter(action => action.kind !== 'd' && action.kind !== 'r')
            .map((action) => ({
            path: action.path,
            content: action.content.toString()
        })));
        if (files.size === 0) {
            return host;
        }
        return rxjs_1.from(files).pipe(operators_1.filter(file => host.exists(file.path)), operators_1.mergeMap((file) => __awaiter(this, void 0, void 0, function* () {
            const systemPath = appRoot.resolve(file.path);
            // tslint:disable-next-line:no-shadowed-variable
            let options = {
                filepath: systemPath
            };
            const resolvedOptions = yield prettier_1.resolveConfig(systemPath);
            if (resolvedOptions) {
                options = Object.assign({}, options, resolvedOptions);
            }
            const support = yield prettier_1.getFileInfo(systemPath, options);
            if (support.ignored || !support.inferredParser) {
                return;
            }
            try {
                host.overwrite(file.path, prettier_1.format(file.content, options));
            }
            catch (e) {
                context.logger.warn(`Could not format ${file.path} because ${e.message}`);
            }
        })), operators_1.map(() => host));
    };
}
exports.formatFiles = formatFiles;
//# sourceMappingURL=format-files.js.map