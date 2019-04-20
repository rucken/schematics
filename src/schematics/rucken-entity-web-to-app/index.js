"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const inflection_1 = require("inflection");
const ts_morph_1 = require("ts-morph");
const ast_utils_1 = require("../..//utils/ast-utils");
const common_1 = require("../../utils/common");
const name_utils_1 = require("../../utils/name-utils");
const format_files_1 = require("../../utils/rules/format-files");
const strings_1 = require("../../utils/strings");
function contentReplacer(options) {
    const toRemoveStrings = [
        `
            <div class="col-md-12">
                <form-group
                    [bindIO]
                    name="description"
                    [title]="strings.description">
                    <textarea
                        formControlName="description"
                        [readonly]="readonly">
                    </textarea>
                </form-group>
            </div>
            <div class="col-md-4">
                <form-group
                    [bindIO]
                    name="status"
                    [title]="strings.status">
                    <status-input
                        (select)="form.get('status').setValue($event)"
                        [project]="data.project"
                        [readonly]="readonly"
                        [apiUrl]="apiUrl">
                        <input
                            formControlName="status"
                            [readonly]="readonly">
                    </status-input>
                </form-group>
            </div>
            <div class="col-md-4">
                <form-group
                    [bindIO]
                    name="openAt"
                    [title]="strings.openAt">
                    <input
                        formControlName="openAt"
                        bsDatepicker
                        [isDisabled]="readonly"
                        [readonly]="readonly">
                </form-group>
            </div>
            <div class="col-md-4">
                <form-group
                    [bindIO]
                    name="closeAt"
                    [title]="strings.closeAt">
                    <input
                        formControlName="closeAt"
                        bsDatepicker
                        [isDisabled]="readonly"
                        [readonly]="readonly">
                </form-group>
            </div>`,
        `Project, `,
        `
  @Input()
  project: Project = undefined;`,
        `
          item.project = this.project;`,
        `
  onChangeFilter(filter?: IBaseEntityGridFilter) {
    filter = filter ? filter : {};
    if (this.project) {
      filter.project = this.project.id;
      this.mockedItems = undefined;
    } else {
      this.mockedItems = [];
    }
    this.ngOnInit();
    super.onChangeFilter(filter);
  }`,
        `
    item.project = this.project;`,
        `
import { StatusInputModule } from '../../statuses/status-input/status-input.module';
import { StatusSelectModule } from '../../statuses/status-select/status-select.module';`,
        `
    StatusInputModule,`,
        `, StatusSelectModule`
    ];
    const toRemoveObject = {};
    toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
    return Object.assign({}, toRemoveObject, { 'translate(\'Tasks': 'translate(\'' + strings_1.capitalize(strings_1.underscore(inflection_1.pluralize(options.name))).replace(new RegExp('_', 'g'), ' '), 'translate(\'Task': 'translate(\'' + strings_1.capitalize(strings_1.underscore(options.name)).replace(new RegExp('_', 'g'), ' '), 'TASKS_FRAME': inflection_1.pluralize(strings_1.underscore(options.name)).toUpperCase() + '_FRAME', 'TasksFrame': strings_1.classify(inflection_1.pluralize(options.name)) + 'Frame', 'Tasks frame': strings_1.classify(inflection_1.pluralize(options.name)) + ' frame', 'tasks-frame-': inflection_1.pluralize(options.name) + '-frame-', '/tasks-frame/': '/' + inflection_1.pluralize(options.name) + '-frame/', '/tasks-frame': '/' + inflection_1.pluralize(options.name) + '-frame', 'tasksFrame': strings_1.camelize(inflection_1.pluralize(options.name)) + 'Frame', 'tasks-frame': inflection_1.pluralize(options.name) + '-frame', '@rucken/todo-web': '@' + options.org + '/' + options.lib, 'tasks': inflection_1.pluralize(options.name), 'Tasks': strings_1.classify(inflection_1.pluralize(options.name)) });
}
function pathReplacer(options) {
    return {
        '/tasks-frame/': '/' + inflection_1.pluralize(options.name) + '-frame/',
        '/tasks-frame': '/' + inflection_1.pluralize(options.name) + '-frame'
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
        `../../../files/rucken/todo/apps/demo/src/app/pages/entities-page/tasks-frame`.replace('{basePath}', options.basePath)
    ];
}
function default_1(schema) {
    return (tree, context) => {
        const options = normalizeOptions(tree, schema);
        const appProjectRootPath = core_1.join(core_1.normalize(options.basePath), options.workspaceProjectRoot);
        return schematics_1.chain([
            ...(templateSources(options).map(templateSource => addAppFiles(templateSource, tree, options))),
            addChildrenRoute(options),
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
        schematics_1.move(core_1.join(core_1.normalize(options.workspace), 'apps', options.app, 'src', 'app', 'pages', 'entities-page', inflection_1.pluralize(options.name) + '-frame'))
    ]));
}
function addChildrenRoute(options) {
    const fileName = name_utils_1.toFileName('entities-page.children-routes');
    const srcPath = core_1.join(core_1.normalize(options.workspace), 'apps', options.app, 'src', 'app', 'pages', 'entities-page', fileName);
    return ast_utils_1.updateFileInTree(srcPath + '.ts', (data, host) => {
        const project = new ts_morph_1.default();
        project.manipulationSettings.set({
            insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
            quoteKind: ts_morph_1.QuoteKind.Single
        });
        const routesConst = `${inflection_1.pluralize(strings_1.underscore(options.name)).toUpperCase()}_FRAME_ROUTES`;
        const currentContent = host.read(`/${srcPath}.ts`).toString('utf-8');
        if (currentContent.indexOf(routesConst) !== -1) {
            return currentContent;
        }
        const sourceFile = project.createSourceFile(`/${srcPath}.ts`, currentContent);
        const routes = sourceFile.getVariableStatement(s => s.hasExportKeyword());
        const declaration = routes.getDeclarations()[0];
        const a = declaration.getFirstChildByKindOrThrow(ts_morph_1.SyntaxKind.ArrayLiteralExpression);
        const text = `{
      path: '${inflection_1.pluralize(options.name)}',
      loadChildren: './${inflection_1.pluralize(options.name)}-frame/${inflection_1.pluralize(options.name)}-frame.module#${strings_1.classify(inflection_1.pluralize(options.name))}FrameModule',
      data: ${routesConst}[0].data
    }`;
        if (a.getElements().filter(e => e.getText().indexOf(routesConst) === -1))
            a.insertElements(a.getElements().length, [text], { useNewLines: true });
        sourceFile.addImportDeclaration({
            moduleSpecifier: `./${inflection_1.pluralize(options.name)}-frame/${inflection_1.pluralize(options.name)}-frame.routes`,
            namedImports: [{ name: routesConst }]
        });
        sourceFile.organizeImports();
        const content = sourceFile
            .getFullText();
        return content;
    });
}
//# sourceMappingURL=index.js.map