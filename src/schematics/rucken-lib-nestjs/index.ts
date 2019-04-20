import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { existsSync } from 'fs';
import { updateJsonInTree } from '../../utils/ast-utils';
import { offsetFromRoot } from '../../utils/common';
import { serializeJson } from '../../utils/fileutils';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { camelize, classify, dasherize, underscore } from '../../utils/strings';
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
  const toRemoveStrings = [];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'EndyKaufman <admin@site15.ru>': options.fullAuthor,
    'EndyKaufman': options.author,
    'admin@site15.ru': options.email,
    'import { RuckenCoreModule } from \'@rucken/core-nestjs\';': `noreplace1`,
    'RuckenCoreModule.forFeature(options)': `noreplace2`,
    '@rucken/core-nestjs': 'noreplace3',
    '@rucken/auth-nestjs': 'noreplace4',
    '/rucken/todo-nestjs': '/' + options.org + '/' + options.name,
    '@rucken/todo-nestjs': '@' + options.org + '/' + options.name,
    '/todo-nestjs/': '/' + options.name + '/',
    '/todo-nestjs': '/' + options.name,
    RuckenTodo: classify(options.org) + classify(options.name),
    Todo: classify(options.name),
    TODO: underscore(options.name).toUpperCase(),
    todo: options.name,
    '/rucken/': '/' + options.org + '/',
    '@rucken/': '@' + options.org + '/',
    Rucken: classify(options.org),
    'rucken-': options.org + '-',
    rucken: camelize(options.org),
    RUCKEN_: underscore(options.org).toUpperCase() + '_',
    '/todo': '/' + options.name,
    'noreplace1': 'import { RuckenCoreModule } from \'@rucken/core-nestjs\';',
    'noreplace2': 'RuckenCoreModule.forFeature(options)',
    'noreplace3': '@rucken/core-nestjs',
    'noreplace4': '@rucken/auth-nestjs'
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/rucken/todo-nestjs/': '/' + options.org + '/' + options.name + '/',
    '/rucken/todo-nestjs': '/' + options.org + '/' + options.name,
    '/todo-nestjs/': '/' + options.name + '/',
    '/todo-nestjs': '/' + options.name,
    '/todo': '/' + options.name
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
  if (path === `/src/config/index.ts`) {
    return `export const ${underscore(options.name).toUpperCase()}_CONFIG = []`;
  }
  if (path === `/src/controllers/index.ts`) {
    return `export const ${underscore(
      options.name
    ).toUpperCase()}_CONTROLLERS = []`;
  }
  if (path === `/src/services/index.ts`) {
    return `export const ${underscore(
      options.name
    ).toUpperCase()}_SERVICES = []`;
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
      main: original.main,
      types: original.types,
      dependencies: original.dependencies
    };
    return serializeJson(obj);
  }
  return undefined;
}
function filterFiles(path: Path) {
  const ignoredPaths = [
    `/src/controllers/project`,
    `/src/controllers/status`,
    `/src/controllers/task`,
    `/src/dto`,
    `/src/entities/project`,
    `/src/entities/status`,
    `/src/entities/task`,
    `/src/migrations`,
    `/src/services/project`,
    `/src/services/status`,
    `/src/services/task`,
    `/src/i18n/ru.mo`,
    `/src/i18n/template.pot`,
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
    `../../../files/rucken/todo-nestjs/libs/rucken/todo-nestjs`.replace('{basePath}', options.basePath)
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
      updatePackageJson(options),
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

  const appProjectName = appDirectory.replace(new RegExp('/', 'g'), '-');

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
function updatePackageJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'package.json'), packageJson => {
    if (!packageJson.externalLibs) {
      packageJson.externalLibs = [];
    }
    packageJson.author = options.fullAuthorObject;
    if (
      packageJson.externalLibs.indexOf('./vendors/rucken/core-nestjs') === -1
    ) {
      packageJson.externalLibs.push(
        './vendors/rucken/core-nestjs'
      );
    }
    if (
      packageJson.externalLibs.indexOf('./vendors/rucken/auth-nestjs') === -1
    ) {
      packageJson.externalLibs.push(
        './vendors/rucken/auth-nestjs'
      );
    }
    if (
      packageJson.externalLibs.indexOf(`./dist/${options.org}/${options.name}`) === -1
    ) {
      packageJson.externalLibs.push(
        `./dist/${options.org}/${options.name}`
      );
    }
    return packageJson;
  });
}
function updateAngularJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'angular.json'), angularJson => {
    const project = {
      root: options.projectRoot,
      sourceRoot: join(options.projectRoot, 'src'),
      projectType: 'library',
      prefix: '',
      schematics: {},
      architect: <any>{}
    };

    project.architect.build = getBuildConfig(project, options);
    project.architect.serve = getServeConfig(project, options);
    project.architect.lint = getLintConfig(project);
    project.architect.test = getTestConfig(project);
    angularJson.projects[options.name] = project;

    return angularJson;
  });
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
      tags: ['nestjs', 'server', 'library', name, options.org]
    };
    return nxJson;
  });
}
function getBuildConfig(project: any, options: NormalizedSchema) {
  return {
    builder: '@nrwl/builders:run-commands',
    options: {
      commands: [
        {
          command: `del-cli ./${join(
            normalize('dist'),
            options.appDirectory
          )}`
        },
        {
          command: `tsc --project ./${join(
            project.root,
            'tsconfig.lib.json'
          )} --outDir ./${join(normalize('dist'), options.appDirectory)}`
        },
        {
          command: `cp-cli ./${join(
            project.root,
            'package.json'
          )} ./${join(normalize('dist'), options.appDirectory, 'package.json')}`
        },
        {
          command: `npm link ./${join(normalize('dist'), options.appDirectory)}`
        }
      ],
      parallel: false
    }
  };
}
function getServeConfig(project: any, options: NormalizedSchema) {
  return {
    builder: '@nrwl/builders:node-execute',
    options: {
      buildTarget: `${options.name}:build`
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
    builder: '@nrwl/builders:jest',
    options: {
      jestConfig: join(project.root, 'jest.config.js'),
      tsConfig: join(project.root, 'tsconfig.spec.json')
    }
  };
}
