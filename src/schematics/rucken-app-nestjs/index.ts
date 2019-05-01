import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { existsSync, readFileSync } from 'fs';
import { vlatest } from '../../utils/versions';
import { updateFileInTree, updateJsonInTree } from '../../utils/ast-utils';
import { offsetFromRoot } from '../../utils/common';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { classify, clearText, dasherize } from '../../utils/strings';
import { Schema } from './schema';
interface NormalizedSchema extends Schema {
  basePath: string;
  appDirectory: string;
  workspaceProjectRoot: Path;
  projectRoot: Path;
  fullAuthor: string;
  fullAuthorObject: {
    name: string,
    email: string
  };
}
function contentReplacer(options: NormalizedSchema) {
  const toRemoveStrings = [
    `
import { RuckenTodoModule } from '@rucken/todo-nestjs';`,
    `
        RuckenTodoModule.forRoot(options),`
  ];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'EndyKaufman <admin@site15.ru>': options.fullAuthor,
    'EndyKaufman': options.author,
    'admin@site15.ru': options.email,
    '/demo/': '/' + options.name + '/',
    '/demo': '/' + options.name,
    "'demo'": "'" + options.name + "'",
    Demo: classify(options.name)
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
    '/demo/': '/' + options.name + '/',
    '/demo': '/' + options.name
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
  const ignoredPaths = [];
  return (
    ignoredPaths.filter(ignoredPath => path.startsWith(ignoredPath)).length ===
    0
  );
}
function templateSources(options: NormalizedSchema) {
  return [
    `../../../files/rucken/todo-nestjs/apps/demo`.replace('{basePath}', options.basePath)
  ];
}
function updateScriptsPostinstallSh(options: NormalizedSchema): Rule {
  return updateFileInTree(join(normalize(options.workspace), 'scripts', 'postinstall.sh'), data => {
    const content = readFileSync(
      `${__dirname}/../../../files/rucken/todo-nestjs/scripts/postinstall.sh`.replace('{localPath}', options.basePath)
    ).toString();
    if (clearText(data).indexOf(clearText(content)) === -1) {
      data = data + '\n' + content;
    }
    return data;
  });
}
function updateScriptsPreinstallSh(options: NormalizedSchema): Rule {
  return updateFileInTree(join(normalize(options.workspace), 'scripts', 'preinstall.sh'), data => {
    const content = readFileSync(
      `${__dirname}/../../../files/rucken/todo-nestjs/scripts/preinstall.sh`.replace('{localPath}', options.basePath)
    ).toString();
    if (clearText(data).indexOf(clearText(content)) === -1) {
      data = data + '\n' + content;
    }
    return data;
  });
}
function updateScriptsPatchJs(options: NormalizedSchema): Rule {
  return updateFileInTree(join(normalize(options.workspace), 'scripts', 'patch.js'), data => {
    const original = readFileSync(
      `${__dirname}/../../../files/rucken/todo-nestjs/scripts/patch.js`.replace('{localPath}', options.basePath)
    ).toString();
    const content = '(function(){\n' + original + ';\n})();';
    if (original && clearText(data).indexOf(clearText(content)) === -1) {
      data = data + '\n' + content;
    }
    return data;
  });
}
function updateDevelopEnv(options: NormalizedSchema): Rule {
  return updateFileInTree(join(normalize(options.workspace), 'develop._env'), data => {
    const content = readFileSync(
      `${__dirname}/../../../files/rucken/todo-nestjs/develop._env`.replace('{localPath}', options.basePath)
    ).toString();
    return content;
  });
}
function updatePackageJson(tree: Tree, options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'package.json'), packageJson => {
    const templatePackageJson = JSON.parse(
      readFileSync(
        `${__dirname}/../../../files/rucken/todo-nestjs/package.json`.replace('{localPath}', options.basePath)
      ).toString()
    );
    packageJson.author = options.fullAuthorObject;
    packageJson.externalLibs = templatePackageJson.externalLibs.filter(
      lib => lib !== './dist/rucken/todo-nestjs'
    );
    if (packageJson.scripts && templatePackageJson.scripts) {
      Object.keys(templatePackageJson.scripts)
        .filter(
          key => key.indexOf('typeorm') !== -1 || key.indexOf('migrate') !== -1
        )
        .forEach(
          key => (packageJson.scripts[key] = templatePackageJson.scripts[key])
        );
    }
    if (packageJson.dependencies && templatePackageJson.dependencies) {
      Object.keys(templatePackageJson.dependencies)
        .filter(key => key.indexOf('webpack') === -1)
        .forEach(
          key =>
            (packageJson.dependencies[key] = vlatest(
              [
                packageJson.dependencies[key],
                templatePackageJson.dependencies[key]
              ]
            ))
        );
    }
    if (packageJson.devDependencies && templatePackageJson.devDependencies) {
      Object.keys(templatePackageJson.devDependencies)
        .filter(key => key.indexOf('webpack') === -1 && !packageJson.dependencies[key])
        .forEach(
          key =>
            (packageJson.devDependencies[key] = vlatest(
              [
                packageJson.devDependencies[key],
                templatePackageJson.devDependencies[key]
              ]
            ))
        );
    }
    return packageJson;
  });
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
      updatePackageJson(tree, options),
      updateScriptsPostinstallSh(options),
      updateScriptsPreinstallSh(options),
      updateScriptsPatchJs(options),
      updateDevelopEnv(options),
      updateTsConfigAppJson(options),
      formatFiles()
    ])(tree, context);
  };
}
function updateTsConfigAppJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspaceProjectRoot), 'tsconfig.app.json'),
    tsConfigJson => {
      if (!tsConfigJson) {
        tsConfigJson = {};
      }
      if (!tsConfigJson.compilerOptions) {
        tsConfigJson.compilerOptions = {};
      }
      if (!tsConfigJson.compilerOptions.paths) {
        tsConfigJson.compilerOptions = {
          sourceMap: true,
          inlineSources: true,
          declaration: false,
          moduleResolution: 'node',
          emitDecoratorMetadata: true,
          experimentalDecorators: true,
          importHelpers: true,
          lib: ['es5', 'es6'],
          target: 'es6',
          module: 'commonjs',
          typeRoots: ['node_modules/@types'],
          baseUrl: '.',
          ...tsConfigJson.compilerOptions
        };
      }
      return tsConfigJson;
    }
  );
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
    normalize('apps'),
    appDirectory
  );
  const appProject = join(
    normalize('apps'),
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
      tags: ['nestjs', 'server', 'application', name]
    };
    return nxJson;
  });
}
function updateAngularJson(options: NormalizedSchema): Rule {
  return updateJsonInTree(join(normalize(options.workspace), 'angular.json'), angularJson => {
    const project = {
      root: options.projectRoot,
      sourceRoot: join(options.projectRoot, 'src'),
      projectType: 'application',
      prefix: '',
      schematics: {},
      architect: <any>{}
    };

    project.architect.build = getBuildConfig(project, options);
    project.architect.serve = getServeConfig(project, options);
    project.architect.lint = getLintConfig(project);
    project.architect.test = getTestConfig(project);
    angularJson.projects[options.name] = project;
    angularJson.defaultProject = options.name;

    return angularJson;
  });
}
function getBuildConfig(project: any, options: NormalizedSchema) {
  return {
    builder: '@nrwl/builders:run-commands',
    options: {
      outputPath: 'dist/demo',
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
            'tsconfig.app.json'
          )} --outDir ./${join(normalize('dist'), options.appDirectory)}`
        }
      ],
      parallel: false
    }
  };
}

function getLintConfig(project: any) {
  return {
    builder: '@angular-devkit/build-angular:tslint',
    options: {
      tsConfig: [
        join(project.root, 'tsconfig.app.json'),
        join(project.root, 'tsconfig.spec.json')
      ],
      exclude: ['**/node_modules/**']
    }
  };
}
function getServeConfig(project: any, options: NormalizedSchema) {
  return {
    builder: '@nrwl/builders:run-commands',
    options: {
      commands: [
        {
          command: './node_modules/.bin/rucken prepare -m dev'
        },
        {
          command: `./node_modules/.bin/nodemon --ext 'ts' --watch 'apps' --watch 'libs' --ignore 'apps/**/*.spec.ts' --ignore 'libs/**/*.spec.ts' --exec ts-node -r tsconfig-paths/register ./${join(project.sourceRoot, 'main.ts')}`
        }
      ],
      parallel: false
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
