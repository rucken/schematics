"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
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
    const appProjectRoot = core_1.join(core_1.normalize(options.workspace), core_1.normalize('libs'), appDirectory);
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
        const declarationChanges = ast_utils_1.addImportToModule(source, `/${appModuleFileSrc}.ts`, libModuleName, libName);
        const declarationRecorder = host.beginUpdate(`/${appModuleFileSrc}.ts`);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        return host;
    };
}
//# sourceMappingURL=index.js.map