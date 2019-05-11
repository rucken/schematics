import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { addImportToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { pluralize } from 'inflection';
import { Project, QuoteKind, SyntaxKind } from 'ts-morph';
import { readIntoSourceFile, updateFileInTree } from '../..//utils/ast-utils';
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
    ``
  ];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'translate(\'Users': 'translate(\'' + capitalize(underscore(pluralize(options.name))).replace(new RegExp('_', 'g'), ' '),
    'translate(\'User': 'translate(\'' + capitalize(underscore(options.name)).replace(new RegExp('_', 'g'), ' '),
    '\'person\'': '\'list-box\'',
    'USERS_PAGE': pluralize(underscore(options.name)).toUpperCase() + '_PAGE',
    'UsersPage': classify(pluralize(options.name)) + 'Page',
    'Users page': classify(pluralize(options.name)) + ' page',
    'users-page-': pluralize(options.name) + '-page-',
    '/users-page/': '/' + pluralize(options.name) + '-page/',
    '/users-page': '/' + pluralize(options.name) + '-page',
    'usersFrame': camelize(pluralize(options.name)) + 'Page',
    'users-page': pluralize(options.name) + '-page',
    '@rucken/ionic': '@' + options.org + '/' + options.lib,
    'usersList': camelize(pluralize(options.name)) + 'List',
    'UsersList': classify(pluralize(options.name)) + 'List',
    'userList': camelize(options.name) + 'List',
    'UserList': classify(options.name) + 'List',
    'users': pluralize(options.name),
    'Users': classify(pluralize(options.name)),
    'user': options.name,
    'User': classify(options.name)
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/users-page/': '/' + pluralize(options.name) + '-page/',
    '/users-page': '/' + pluralize(options.name) + '-page'
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
    `../../../files/rucken/todo-ionic/apps/demo/src/app/pages/users-page`.replace('{basePath}', options.basePath)
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
      importToModule(options),
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
    normalize('libs'), appDirectory
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
          normalize('apps'),
          options.app,
          'src',
          'app',
          'pages',
          `${pluralize(options.name)}-page`
        )
      )
    ])
  );
}

function addChildrenRoute(options: NormalizedSchema): Rule {
  const fileName = toFileName('app.routes');
  const srcPath = join(
    normalize(options.workspace),
    'apps',
    options.app,
    'src',
    'app',
    fileName
  );
  return updateFileInTree(srcPath + '.ts', (data: string, host: Tree) => {
    const project = new Project();
    project.manipulationSettings.set({
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      quoteKind: QuoteKind.Single
    });
    const routesConst = `${pluralize(underscore(options.name)).toUpperCase()}_PAGE_ROUTES`;
    const currentContent = host.read(`/${srcPath}.ts`).toString('utf-8');
    const sourceFile = project.createSourceFile(
      `/${srcPath}.ts`,
      currentContent
    );
    if (currentContent.indexOf(routesConst) !== -1) {
      return currentContent;
    }
    const routes = sourceFile.getVariableStatements().filter(s => s.hasExportKeyword())[0];
    if (routes) {
      const declaration = routes.getDeclarations()[0];
      const a = declaration.getFirstChildByKindOrThrow(SyntaxKind.ArrayLiteralExpression);
      const text = `{
      path: '${pluralize(options.name)}',
      loadChildren: './pages/${pluralize(options.name)}-page/${pluralize(options.name)}-page.module#${classify(pluralize(options.name))}PageModule',
      data: ${routesConst}[0].data
    }`;
      if (
        a.getElements().filter(e => e.getText().indexOf(routesConst) === -1)
      ) {
        a.insertElements(a.getElements().length - 1, [text], { useNewLines: true });
      }
      sourceFile.addImportDeclaration({
        moduleSpecifier: `./pages/${pluralize(options.name)}-page/${pluralize(options.name)}-page.routes`,
        namedImports: [{ name: routesConst }]
      });
      sourceFile.organizeImports();
    }
    const content = sourceFile
      .getFullText();
    return content;
  });
}
function importToModule(options: NormalizedSchema): Rule {
  const appModuleFileName = toFileName('app.module');
  const libModuleName = classify(pluralize(options.name)) + 'ListFiltersModalModule';
  const libName = '@' + options.org + '/' + options.lib;
  const appModuleFileSrc = join(
    normalize(options.workspace),
    'apps',
    options.app,
    'src',
    'app',
    appModuleFileName
  );
  return (host: Tree) => {
    const source = readIntoSourceFile(host, `/${appModuleFileSrc}.ts`);
    const declarationChanges = addImportToModule(
      source,
      `/${appModuleFileSrc}.ts`,
      `${libModuleName}.forRoot()`,
      libName);
    const declarationRecorder = host.beginUpdate(`/${appModuleFileSrc}.ts`);
    for (const change of declarationChanges) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);
    return host;
  };
}
