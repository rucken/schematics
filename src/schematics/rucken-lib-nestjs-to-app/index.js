"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const ast_utils_2 = require("../../utils/ast-utils");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function default_1(schema) {
    return (tree, context) => {
        const options = normalizeOptions(tree, schema);
        return schematics_1.chain([
            importToModule(options),
            format_files_1.formatFiles()
        ])(tree, context);
    };
}
exports.default = default_1;
function normalizeOptions(tree, options) {
    const basePath = tree._backend._root;
    const appDirectory = options.org
        ? `${name_utils_1.toFileName(options.org)}/${name_utils_1.toFileName(options.name)}`
        : name_utils_1.toFileName(options.name);
    const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');
    const appProjectRoot = core_1.join(core_1.normalize(options.workspace), 'libs', appDirectory);
    const appProject = core_1.join(core_1.normalize('libs'), appDirectory);
    return Object.assign({}, options, { name: name_utils_1.toFileName(options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), app: options.app, org: options.org, appDirectory, workspaceProjectRoot: appProjectRoot, projectRoot: appProject, basePath });
}
function importToModule(options) {
    const appModuleFileName = name_utils_1.toFileName('app.module');
    const libModuleName = strings_1.classify(options.org) + strings_1.classify(options.name) + 'Module';
    const libName = '@' + options.org + '/' + options.name;
    const appModuleFileSrc = core_1.join(core_1.normalize(options.workspace), 'apps', options.app, 'src', 'app', appModuleFileName);
    return (host) => {
        const source = ast_utils_2.readIntoSourceFile(host, `/${appModuleFileSrc}.ts`);
        if (!ast_utils_1.isImported(source, `${libModuleName}`, libName)) {
            const change = ast_utils_1.insertImport(source, `/${appModuleFileSrc}.ts`, `${libModuleName}`, libName);
            if (change) {
                const recorder = host.beginUpdate(`/${appModuleFileSrc}.ts`);
                recorder.insertLeft(change.pos, change.toAdd);
                host.commitUpdate(recorder);
            }
        }
        const appModuleFileContent = host.read(`/${appModuleFileSrc}.ts`).toString();
        if (appModuleFileContent.indexOf(`${libModuleName}.forRoot(options)`) === -1) {
            host.overwrite(`/${appModuleFileSrc}.ts`, appModuleFileContent.replace('TypeOrmModule.forRoot()', `${libModuleName}.forRoot(options),\nTypeOrmModule.forRoot()`));
        }
        return host;
    };
}
//# sourceMappingURL=index.js.map