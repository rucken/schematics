"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const dot = require("dot-object");
const inflection_1 = require("inflection");
const ts_morph_1 = require("ts-morph");
const ast_utils_1 = require("../../utils/ast-utils");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function default_1(schema) {
    return (tree, context) => {
        const options = normalizeOptions(tree, schema);
        return schematics_1.chain([
            /*schematic('rucken-lib-nestjs', {
              name: options.lib,
              org: options.org
            }),*/
            addAppFiles('./files', Object.assign({}, options, { libSrc: core_1.join(core_1.normalize(options.projectRoot), 'src'), ts: 'ts', timestamp: options.timestamp || new Date().getTime(), camelize: strings_1.camelize,
                underscore: strings_1.underscore,
                pluralize: inflection_1.pluralize,
                classify: strings_1.classify,
                capitalize: strings_1.capitalize, model: createModelOptions(options), config: createConfigOptions(options) }, dot.dot({ model: createModelOptions(options) }), dot.dot({ config: createConfigOptions(options) }))),
            createProviders(options, 'controllers', false),
            createProviders(options, 'entities', false),
            createProviders(options, 'services'),
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
function createModelOptions(options) {
    const fileName = name_utils_1.toFileName(options.name
        .split('.')
        .map(word => strings_1.dasherize(word))
        .join('.'));
    const srcFile = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', 'models', fileName);
    const lowerName = strings_1.underscore(options.name).split('_').join(' ').toLowerCase() + ' ';
    const upperName = strings_1.capitalize(strings_1.underscore(options.name).split('_').join(' ').toLowerCase()) + ' ';
    return {
        srcFile: srcFile + '.ts',
        lowerName,
        upperName
    };
}
function createConfigOptions(options) {
    const fileName = name_utils_1.toFileName(options.name
        .split('.')
        .map(word => strings_1.dasherize(word))
        .join('.'));
    const srcFile = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', 'configs', fileName);
    return {
        srcFile: srcFile + '.config.ts',
        fileName
    };
}
function createProviders(options, typeName, asProviders = true) {
    const fileName = name_utils_1.toFileName('index');
    const srcPath = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', typeName.toLowerCase());
    const srcFile = core_1.join(core_1.normalize(options.workspaceProjectRoot), 'src', typeName.toLowerCase(), fileName);
    return ast_utils_1.updateFileInTree(srcFile + '.ts', (data, host) => {
        const project = new ts_morph_1.Project();
        project.manipulationSettings.set({
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            quoteKind: ts_morph_1.QuoteKind.Single
        });
        host.getDir(srcPath).subfiles.forEach(key => project.createSourceFile('/' + core_1.join(srcPath, key), host.read('/' + core_1.join(srcPath, key)).toString('utf-8')));
        project.addExistingSourceFiles(srcPath);
        const allImports = [];
        let allClasses = [];
        project
            .getSourceFiles()
            .filter((sourceFile, index) => sourceFile.getBaseName() !== 'index.ts')
            .forEach((sourceFile, index) => {
            const classes = sourceFile.getClasses();
            const classesNames = classes
                .filter((klass) => klass.hasExportKeyword())
                .map((klass) => klass.getName());
            allClasses = [
                ...allClasses,
                ...classesNames
            ];
            allImports.push(`import { ${classesNames.join(', ')} } from './${sourceFile.getBaseName().replace('.ts', '')}';`);
        });
        const newSourceFile = project.createSourceFile('index.ts', (asProviders ? `import { Provider } from '@nestjs/common';
` : '') +
            `${allImports.join('\n')}

export const ${strings_1.underscore(options.lib).toUpperCase()}_${typeName.toUpperCase()}${asProviders ? ': Provider[]' : ''} = [
    ${allClasses.map(provider => JSON.stringify(provider)).join(', ')}
  ]`);
        newSourceFile.fixMissingImports();
        const content = newSourceFile
            .getFullText()
            .replace(new RegExp('"', 'g'), '');
        return content;
    });
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