"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const ast_utils_1 = require("@schematics/angular/utility/ast-utils");
const change_1 = require("@schematics/angular/utility/change");
const inflection_1 = require("inflection");
const ts_morph_1 = require("ts-morph");
const ast_utils_2 = require("../..//utils/ast-utils");
const common_1 = require("../../utils/common");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function contentReplacer(options) {
    const toRemoveStrings = [
        ``
    ];
    const toRemoveObject = {};
    toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
    return Object.assign({}, toRemoveObject, { 'translate(\'Users': 'translate(\'' + strings_1.capitalize(strings_1.underscore(inflection_1.pluralize(options.name))).replace(new RegExp('_', 'g'), ' '), 'translate(\'User': 'translate(\'' + strings_1.capitalize(strings_1.underscore(options.name)).replace(new RegExp('_', 'g'), ' '), '\'person\'': '\'list-box\'', 'USERS_PAGE': inflection_1.pluralize(strings_1.underscore(options.name)).toUpperCase() + '_PAGE', 'UsersPage': strings_1.classify(inflection_1.pluralize(options.name)) + 'Page', 'Users page': strings_1.classify(inflection_1.pluralize(options.name)) + ' page', 'users-page-': inflection_1.pluralize(options.name) + '-page-', '/users-page/': '/' + inflection_1.pluralize(options.name) + '-page/', '/users-page': '/' + inflection_1.pluralize(options.name) + '-page', 'usersFrame': strings_1.camelize(inflection_1.pluralize(options.name)) + 'Page', 'users-page': inflection_1.pluralize(options.name) + '-page', '@rucken/ionic': '@' + options.org + '/' + options.lib, 'usersList': strings_1.camelize(inflection_1.pluralize(options.name)) + 'List', 'UsersList': strings_1.classify(inflection_1.pluralize(options.name)) + 'List', 'userList': strings_1.camelize(options.name) + 'List', 'UserList': strings_1.classify(options.name) + 'List', 'users': inflection_1.pluralize(options.name), 'Users': strings_1.classify(inflection_1.pluralize(options.name)), 'user': options.name, 'User': strings_1.classify(options.name) });
}
function pathReplacer(options) {
    return {
        '/users-page/': '/' + inflection_1.pluralize(options.name) + '-page/',
        '/users-page': '/' + inflection_1.pluralize(options.name) + '-page'
    };
}
function updateSourceFiles(path, content, options) {
    return undefined;
}
function filterFiles(path) {
    const ignoredPaths = [];
    return (ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
        0);
}
function templateSources(options) {
    return [
        `../../../files/rucken/todo-ionic/apps/demo/src/app/pages/users-page`.replace('{basePath}', options.basePath)
    ];
}
function default_1(schema) {
    return (tree, context) => {
        const options = normalizeOptions(tree, schema);
        const appProjectRootPath = core_1.join(core_1.normalize(options.basePath), options.workspaceProjectRoot);
        return schematics_1.chain([
            ...(templateSources(options).map(templateSource => addAppFiles(templateSource, tree, options))),
            addChildrenRoute(options),
            importToModule(options),
            format_files_1.formatFiles()
        ])(tree, context);
    };
}
exports.default = default_1;
function updateFileFileEntry(tree, fileEntry, options) {
    let contentReplaced = false, pathReplaced = false, content = fileEntry.content.toString(), path = fileEntry.path.toString();
    const updatedContent = updateSourceFiles(path, content, options);
    const contentReplacerResult = contentReplacer(options), pathReplacerResult = pathReplacer(options);
    if (updatedContent !== undefined) {
        content = updatedContent;
        contentReplaced = true;
    }
    Object.keys(contentReplacerResult).forEach(word => {
        if (content.indexOf(word) !== -1) {
            content = content.split(word).join(contentReplacerResult[word]);
            contentReplaced = true;
        }
    });
    Object.keys(pathReplacerResult).forEach(word => {
        if (path.indexOf(word) !== -1) {
            path = path.split(word).join(pathReplacerResult[word]);
            pathReplaced = true;
        }
    });
    if (contentReplaced || pathReplaced) {
        return { path: path, content: Buffer.from(content) };
    }
    return fileEntry;
}
function normalizeOptions(tree, options) {
    const basePath = tree._backend._root;
    const appDirectory = options.org
        ? `${name_utils_1.toFileName(options.org)}/${name_utils_1.toFileName(options.lib)}`
        : name_utils_1.toFileName(options.lib);
    const appProjectRoot = core_1.join(core_1.normalize(options.workspace), core_1.normalize('libs'), appDirectory);
    const appProject = core_1.join(core_1.normalize('libs'), appDirectory);
    return Object.assign({}, options, { name: name_utils_1.toFileName(options.name
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), lib: name_utils_1.toFileName(options.lib
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), entitiesLib: name_utils_1.toFileName(options.entitiesLib
            .split('.')
            .map(word => strings_1.dasherize(word))
            .join('.')), app: options.app, org: options.org, appDirectory, workspaceProjectRoot: appProjectRoot, projectRoot: appProject, basePath });
}
function addAppFiles(templateSource, tree, options) {
    return schematics_1.mergeWith(schematics_1.apply(schematics_1.url(templateSource), [
        schematics_1.filter(path => filterFiles(path)),
        schematics_1.template({
            tmpl: '',
            name: options.name,
            root: options.projectRoot,
            offset: common_1.offsetFromRoot(options.projectRoot)
        }),
        schematics_1.forEach((fileEntry) => updateFileFileEntry(tree, fileEntry, options)),
        schematics_1.move(core_1.join(core_1.normalize(options.workspace), core_1.normalize('apps'), options.app, 'src', 'app', 'pages', `${inflection_1.pluralize(options.name)}-page`))
    ]));
}
function addChildrenRoute(options) {
    const fileName = name_utils_1.toFileName('app.routes');
    const srcPath = core_1.join(core_1.normalize(options.workspace), 'apps', options.app, 'src', 'app', fileName);
    return ast_utils_2.updateFileInTree(srcPath + '.ts', (data, host) => {
        const project = new ts_morph_1.default();
        project.manipulationSettings.set({
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            quoteKind: ts_morph_1.QuoteKind.Single
        });
        const routesConst = `${inflection_1.pluralize(strings_1.underscore(options.name)).toUpperCase()}_PAGE_ROUTES`;
        const currentContent = host.read(`/${srcPath}.ts`).toString('utf-8');
        const sourceFile = project.createSourceFile(`/${srcPath}.ts`, currentContent);
        if (currentContent.indexOf(routesConst) !== -1) {
            return currentContent;
        }
        const routes = sourceFile.getVariableStatements().filter(s => s.hasExportKeyword())[0];
        if (routes) {
            const declaration = routes.getDeclarations()[0];
            const a = declaration.getFirstChildByKindOrThrow(ts_morph_1.SyntaxKind.ArrayLiteralExpression);
            const text = `{
      path: '${inflection_1.pluralize(options.name)}',
      loadChildren: './pages/${inflection_1.pluralize(options.name)}-page/${inflection_1.pluralize(options.name)}-page.module#${strings_1.classify(inflection_1.pluralize(options.name))}PageModule',
      data: ${routesConst}[0].data
    }`;
            if (a.getElements().filter(e => e.getText().indexOf(routesConst) === -1))
                a.insertElements(a.getElements().length - 1, [text], { useNewLines: true });
            sourceFile.addImportDeclaration({
                moduleSpecifier: `./pages/${inflection_1.pluralize(options.name)}-page/${inflection_1.pluralize(options.name)}-page.routes`,
                namedImports: [{ name: routesConst }]
            });
            sourceFile.organizeImports();
        }
        const content = sourceFile
            .getFullText();
        return content;
    });
}
function importToModule(options) {
    const appModuleFileName = name_utils_1.toFileName('app.module');
    const libModuleName = strings_1.classify(inflection_1.pluralize(options.name)) + 'ListFiltersModalModule';
    const libName = '@' + options.org + '/' + options.lib;
    const appModuleFileSrc = core_1.join(core_1.normalize(options.workspace), 'apps', options.app, 'src', 'app', appModuleFileName);
    return (host) => {
        const source = ast_utils_2.readIntoSourceFile(host, `/${appModuleFileSrc}.ts`);
        const declarationChanges = ast_utils_1.addImportToModule(source, `/${appModuleFileSrc}.ts`, `${libModuleName}.forRoot()`, libName);
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