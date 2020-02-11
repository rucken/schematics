"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const inflection_1 = require("inflection");
const ts_morph_1 = require("ts-morph");
const ast_utils_2 = require("../../utils/ast-utils");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function default_1(schema) {
    return (tree, context) => {
        const options = normalizeOptions(tree, schema);
        return schematics_1.chain([
            /*schematic('rucken-lib', {
              name: options.lib,
              org: options.org
            }),*/
            addAppFiles('./files', Object.assign({}, options, { libSrc: core_1.join(core_1.normalize(options.projectRoot), 'src', 'lib'), ts: 'ts', timestamp: new Date().getTime(), camelize: strings_1.camelize,
                underscore: strings_1.underscore,
                pluralize: inflection_1.pluralize,
                classify: strings_1.classify,
                capitalize: strings_1.capitalize, lowerName: strings_1.underscore(options.name).split('_').join(' ').toLowerCase() + ' ', upperName: strings_1.capitalize(strings_1.underscore(options.name).split('_').join(' ').toLowerCase()) + ' ' })),
            createProviders(options),
            importProvidersToModule(options),
            format_files_1.formatFiles()
        ])(tree, context);
    };
}
exports.default = default_1;
function addAppFiles(templateSource, options) {
    return schematics_1.mergeWith(schematics_1.apply(schematics_1.url(templateSource), [
        schematics_1.template(options),
        schematics_1.move(core_1.join(core_1.normalize(options.workspace)))
    ]));
}
function createProviders(options) {
    const fileName = name_utils_1.toFileName('providers');
    const srcPath = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', 'lib', 'configs');
    const srcFile = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', 'lib', 'configs', fileName);
    return ast_utils_2.updateFileInTree(srcFile + '.ts', (data, host) => {
        const project = new ts_morph_1.Project();
        project.manipulationSettings.set({
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            quoteKind: ts_morph_1.QuoteKind.Single
        });
        host.getDir(srcPath).subfiles.forEach(key => project.createSourceFile('/' + core_1.join(srcPath, key), host.read('/' + core_1.join(srcPath, key)).toString('utf-8')));
        project.addExistingSourceFiles(srcPath);
        let allImports = [];
        let allProviders = [];
        project
            .getSourceFiles()
            .filter((sourceFile, index) => sourceFile.getBaseName() !== 'providers.ts')
            .forEach((sourceFile, index) => {
            const variableStatements = sourceFile.getVariableStatements();
            const variables = variableStatements
                .filter((variableStatement) => variableStatement.hasExportKeyword())
                .map((variableStatement) => variableStatement.getStructure().declarations[0]['name']);
            allProviders = [
                ...allProviders,
                ...variables
                    .filter(variable => variable.indexOf('DEFAULT_') !== 0 &&
                    variables.filter(subVariable => subVariable === `DEFAULT_${variable.replace('_TOKEN', '')}`).length === 1)
                    .map(variable => ({
                    provide: variable,
                    useValue: `DEFAULT_${variable.replace('_TOKEN', '')}`
                }))
            ];
            allImports.push(`import { ${variables.join(', ')} } from './${sourceFile.getBaseName().replace('.ts', '')}';`);
        });
        allImports = allImports.filter((elem, index, self) => {
            return index === self.indexOf(elem);
        });
        allProviders = allProviders.filter((elem, index, self) => {
            return index === self.indexOf(elem);
        });
        const newSourceFile = project.createSourceFile('providers.ts', `import { Provider } from '@angular/core';
${allImports.join('\n')}

export const ENTITIES_PROVIDERS: Provider[] = [
    ${allProviders.map(provider => JSON.stringify(provider)).join(', ')}
  ]`);
        newSourceFile.fixMissingImports();
        const content = newSourceFile
            .getFullText()
            .replace(new RegExp('"', 'g'), '');
        return content;
    });
}
function importProvidersToModule(options) {
    const fileName = name_utils_1.toFileName('providers');
    const moduleName = name_utils_1.toFileName(options.lib + '.module');
    const srcFile = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', 'lib', 'configs', fileName);
    const srcModuleFile = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', 'lib', moduleName);
    return (host) => {
        const source = ast_utils_2.readIntoSourceFile(host, `/${srcModuleFile}.ts`);
        const declarationChanges = ast_utils_1.addProviderToModule(source, `/${srcModuleFile}.ts`, 'ENTITIES_PROVIDERS', './configs/providers');
        const declarationRecorder = host.beginUpdate(`/${srcModuleFile}.ts`);
        for (const change of declarationChanges) {
            if (change instanceof change_1.InsertChange) {
                declarationRecorder.insertLeft(change.pos, change.toAdd);
            }
        }
        host.commitUpdate(declarationRecorder);
        return host;
    };
}
function normalizeOptions(tree, options) {
    const basePath = tree._backend._root;
    const appDirectory = options.org
        ? `${name_utils_1.toFileName(options.org)}/${name_utils_1.toFileName(options.lib)}`
        : name_utils_1.toFileName(options.lib);
    const appProjectRoot = core_1.join(core_1.normalize(options.workspace), 'libs', appDirectory);
    const appProject = core_1.join(core_1.normalize('libs'), appDirectory);
    return Object.assign({}, options, { name: name_utils_1.toFileName(options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), lib: name_utils_1.toFileName(options.lib
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), org: options.org, appDirectory, workspaceProjectRoot: appProjectRoot, projectRoot: appProject, basePath });
}
//# sourceMappingURL=index.js.map