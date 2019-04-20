import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { existsSync } from 'fs';
import { updateJsonInTree } from '../../utils/ast-utils';
import { offsetFromRoot } from '../../utils/common';
import { serializeJson } from '../../utils/fileutils';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { camelize, capitalize, classify, dasherize, underscore } from '../../utils/strings';
import { Schema } from './schema';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
  org: string;
  fullAuthor: string;
  fullAuthorObject: {
    name: string,
    email: string
  };
}
function contentReplacer(options: NormalizedSchema) {
  const toRemoveStrings = [
    `
import { ENTITIES_PROVIDERS } from './configs/providers';`,
    `
    ...ENTITIES_PROVIDERS`
  ];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'EndyKaufman <admin@site15.ru>': options.fullAuthor,
    'EndyKaufman': options.author,
    'admin@site15.ru': options.email,
    '/rucken/todo-core': '/' + options.org + '/' + options.name,
    '@rucken/todo-core': '@' + options.org + '/' + options.name,
    '/todo-core/': '/' + options.name + '/',
    '/todo-core': '/' + options.name,
    'todo-core': options.name,
    RuckenTodoCore: classify(options.org) + classify(options.name),
    TodoCore: classify(options.name),
    'Todo core': capitalize(options.name)
      .split('-')
      .join(' '),
    todoCore: camelize(options.name),
    TODO_WEB: underscore(options.name).toUpperCase()
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/todo-core/': '/' + options.name + '/',
    '/todo-core': '/' + options.name,
    '/rucken/todo-core/': '/' + options.org + '/' + options.name + '/',
    '/rucken/todo-core': '/' + options.org + '/' + options.name
  };
}
function updateSourceFiles(
  path: string,
  content: string,
  options: NormalizedSchema
): string {
  if (path === `/src/i18n/ru.po`) {
    return 'export const RuI18n = {};';
  }
  if (path === `/src/index.ts`) {
    return `export * from './i18n/ru.i18n';`
  }
  if (path === `/package.json`) {
    const original = JSON.parse(content);
    const obj = {
      name: original.name,
      version: '0.0.1',
      engines: original.engines,
      peerDependencies: original.peerDependencies,
      dependencies: {
        ['@rucken/core']: original.dependencies['@rucken/core']
      }
    };
    return serializeJson(obj);
  }
  return undefined;
}
function filterFiles(path: Path) {
  const ignoredPaths = [
    `/src/i18n/ru.mo`,
    `/src/i18n/template.pot`,
    `/src/lib/configs`,
    `/src/lib/models`,
    `/README.md`,
    `/LICENSE`
  ];
  return (
    ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
    0
  );
}
function templateSources(options: NormalizedSchema) {
  return [
    `../../../files/rucken/todo/libs/rucken/todo-core`.replace('{basePath}', options.basePath)
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
        !existsSync(appProjectRootPath) ?
          templateSources(options).map(templateSource =>
            addAppFiles(templateSource, tree, options)
          ) :
          []
      ),
      updateAngularJson(options),
      updateNxJson(options),
      updateTsConfigJson(options),
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
    ? `${toFileName(options.org)}/${toFileName(options.name)}`
    : toFileName(options.name);

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
    fullAuthorObject: {
      name: options.author,
      email: options.email
    },
    fullAuthor: (options.author && options.email) ? `${options.author} <${options.email}>` : '',
    name: toFileName(
      options.name
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    org: options.org,
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
      forEach((fileEntry: FileEntry) => {
        return updateFileFileEntry(tree, fileEntry, options);
      }),
      move(options.workspaceProjectRoot)
    ])
  );
}
function updateTsConfigJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'tsconfig.json'), tsConfigJson => {
    const name = '@' + options.org + '/' + options.name;
    if (!tsConfigJson) {
      tsConfigJson = {};
    }
    if (!tsConfigJson.compilerOptions) {
      tsConfigJson.compilerOptions = {};
    }
    if (!tsConfigJson.compilerOptions.paths) {
      tsConfigJson.compilerOptions.paths = {};
    }
    tsConfigJson.compilerOptions.paths[name] = [
      join(options.projectRoot, 'src')
    ];
    tsConfigJson.compilerOptions.paths[name + '/*'] = [
      join(options.projectRoot, 'src', '/*')
    ];
    return tsConfigJson;
  });
}
function updateNxJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'nx.json'), nxJson => {
    if (!nxJson) {
      nxJson = {};
    }
    if (!nxJson.projects) {
      nxJson.projects = {};
    }
    const name = options.name;
    nxJson.projects[name] = {
      tags: ['angular', 'client', 'library', name, options.org]
    };
    return nxJson;
  });
}
function updateAngularJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'angular.json'), angularJson => {
    const project = {
      root: options.projectRoot,
      sourceRoot: join(options.projectRoot, 'src'),
      projectType: 'library',
      prefix: '',
      architect: <any>{
        build: <any>{},
        test: <any>{},
        lint: <any>{}
      },
      schematics: {
        '@nrwl/schematics:component': {
          styleext: 'scss'
        }
      }
    };

    project.architect.build = getBuildConfig(project, options);
    project.architect.test = getTestConfig(project);
    project.architect.lint = getLintConfig(project);
    angularJson.projects[options.name] = project;

    return angularJson;
  });
}
function getBuildConfig(project: any, options: NormalizedSchema) {
  return {
    builder: '@angular-devkit/build-ng-packagr:build',
    options: {
      tsConfig: join(project.root, 'tsconfig.lib.json'),
      project: join(project.root, 'ng-package.json')
    }
  };
}

function getLintConfig(project: any) {
  return {
    builder: '@angular-devkit/build-angular:tslint',
    options: {
      tsConfig: [
        join(project.root, 'tsconfig.lib.json'),
        join(project.root, 'tsconfig.spec.json')
      ],
      exclude: ['**/node_modules/**']
    }
  };
}
function getTestConfig(project: any) {
  return {
    builder: '@angular-devkit/build-angular:karma',
    options: {
      main: join(project.sourceRoot, 'test.ts'),
      tsConfig: join(project.root, 'tsconfig.spec.json'),
      karmaConfig: join(project.root, 'karma.conf.js')
    }
  };
}
