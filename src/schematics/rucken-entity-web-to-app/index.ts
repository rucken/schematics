import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { existsSync } from 'fs';
import { pluralize } from 'inflection';
import { Project, QuoteKind, SyntaxKind } from 'ts-morph';
import { updateFileInTree } from '../..//utils/ast-utils';
import { offsetFromRoot } from '../../utils/common';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { camelize, capitalize, classify, dasherize, underscore } from '../../utils/strings';
import { Schema } from './schema';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
}
function contentReplacer(options: NormalizedSchema) {
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
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'translate(\'Tasks': 'translate(\'' + capitalize(underscore(pluralize(options.name))).replace(new RegExp('_', 'g'), ' '),
    'translate(\'Task': 'translate(\'' + capitalize(underscore(options.name)).replace(new RegExp('_', 'g'), ' '),
    'TASKS_FRAME': pluralize(underscore(options.name)).toUpperCase() + '_FRAME',
    'TasksFrame': classify(pluralize(options.name)) + 'Frame',
    'Tasks frame': classify(pluralize(options.name)) + ' frame',
    'tasks-frame-': pluralize(options.name) + '-frame-',
    '/tasks-frame/': '/' + pluralize(options.name) + '-frame/',
    '/tasks-frame': '/' + pluralize(options.name) + '-frame',
    'tasksFrame': camelize(pluralize(options.name)) + 'Frame',
    'tasks-frame': pluralize(options.name) + '-frame',
    '@rucken/todo-web': '@' + options.org + '/' + options.lib,
    'tasks': pluralize(options.name),
    'Tasks': classify(pluralize(options.name))
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/tasks-frame/': '/' + pluralize(options.name) + '-frame/',
    '/tasks-frame': '/' + pluralize(options.name) + '-frame'
  };
}
function updateSourceFiles(
  path: string,
  content: string,
  options: NormalizedSchema
): string {
  return undefined;
}
function filterFiles(path: Path) {
  const ignoredPaths = [
  ];
  return (
    ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
    0
  );
}
function templateSources(options: NormalizedSchema) {
  return [
    `../../../files/rucken/todo/apps/demo/src/app/pages/entities-page/tasks-frame`.replace('{basePath}', options.basePath)
  ];
}
export default function (schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const options = normalizeOptions(tree, schema);
    const appProjectRootPath = join(
      normalize(options.basePath),
      options.workspaceProjectRoot
    );
    return chain([
      ...(
        templateSources(options).map(templateSource =>
          addAppFiles(templateSource, tree, options)
        )
      ),
      addChildrenRoute(options),
      formatFiles()
    ])(tree, context);
  };
}
function updateFileFileEntry(
  tree: Tree,
  fileEntry: FileEntry,
  options: NormalizedSchema
): FileEntry {
  let contentReplaced = false,
    pathReplaced = false,
    content = fileEntry.content.toString(),
    path = fileEntry.path.toString();
  const updatedContent = updateSourceFiles(path, content, options);
  const contentReplacerResult = contentReplacer(options),
    pathReplacerResult = pathReplacer(options);
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
    return <FileEntry>{ path: path, content: Buffer.from(content) };
  }
  return fileEntry;
}
function normalizeOptions(tree: Tree, options: Schema): NormalizedSchema {
  const basePath = (<any>tree)._backend._root;

  const appDirectory = options.org
    ? `${toFileName(options.org)}/${toFileName(options.lib)}`
    : toFileName(options.lib);
  const appProjectRoot = join(
    normalize(options.workspace),
    normalize('libs'),
    appDirectory
  );
  const appProject = join(
    normalize('libs'),
    appDirectory
  );

  return {
    ...options,
    name: toFileName(
      options.name
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    lib: toFileName(
      options.lib
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    entitiesLib: toFileName(
      (options.entitiesLib || options.lib)
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    app: options.app,
    org: options.org,
    entitiesLibOrg: toFileName(
      (options.entitiesLibOrg || options.org)
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    appDirectory,
    workspaceProjectRoot: appProjectRoot,
    projectRoot: appProject,
    basePath
  };
}
function addAppFiles(
  templateSource: string,
  tree: Tree,
  options: NormalizedSchema
): Rule {
  return mergeWith(
    apply(url(templateSource), [
      filter(path => filterFiles(path)),
      template({
        tmpl: '',
        name: options.name,
        root: options.projectRoot,
        offset: offsetFromRoot(options.projectRoot)
      }),
      forEach((fileEntry: FileEntry) =>
        updateFileFileEntry(tree, fileEntry, options)
      ),
      move(
        join(
          normalize(options.workspace),
          'apps',
          options.app,
          'src',
          'app',
          'pages',
          'entities-page',
          pluralize(options.name) + '-frame'
        )
      )
    ])
  );
}

function addChildrenRoute(options: NormalizedSchema): Rule {
  const fileName = toFileName('entities-page.children-routes');
  const srcPath = join(
    normalize(options.workspace),
    'apps',
    options.app,
    'src',
    'app',
    'pages',
    'entities-page',
    fileName
  );
  return updateFileInTree(srcPath + '.ts', (data: string, host: Tree) => {
    const project = new Project();
    project.manipulationSettings.set({
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      quoteKind: QuoteKind.Single
    });
    const routesConst = `${pluralize(underscore(options.name)).toUpperCase()}_FRAME_ROUTES`;
    const currentContent = host.read(`/${srcPath}.ts`).toString('utf-8');
    if (currentContent.indexOf(routesConst) !== -1) {
      return currentContent;
    }
    const sourceFile = project.createSourceFile(
      `/${srcPath}.ts`,
      currentContent
    );
    const routes = sourceFile.getVariableStatement(s => s.hasExportKeyword());
    const declaration = routes.getDeclarations()[0];
    const a = declaration.getFirstChildByKindOrThrow(SyntaxKind.ArrayLiteralExpression);
    const text = `{
      path: '${pluralize(options.name)}',
      loadChildren: './${pluralize(options.name)}-frame/${pluralize(options.name)}-frame.module#${classify(pluralize(options.name))}FrameModule',
      data: ${routesConst}[0].data
    }`;
    if (
      a.getElements().filter(e => e.getText().indexOf(routesConst) === -1)
    ) {
      a.insertElements(a.getElements().length, [text], { useNewLines: true });
    }
    sourceFile.addImportDeclaration({
      moduleSpecifier: `./${pluralize(options.name)}-frame/${pluralize(options.name)}-frame.routes`,
      namedImports: [{ name: routesConst }]
    });
    sourceFile.organizeImports();
    const content = sourceFile
      .getFullText();
    return content;
  });
}
