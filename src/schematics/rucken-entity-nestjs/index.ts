import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import * as dot from 'dot-object';
import { pluralize } from 'inflection';
import { ClassDeclaration, Project, QuoteKind } from 'ts-morph';
import { updateFileInTree } from '../../utils/ast-utils';
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
}
export default function (schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const options = normalizeOptions(tree, schema);
    return chain([
      /*schematic('rucken-lib-nestjs', {
        name: options.lib,
        org: options.org
      }),*/
      addAppFiles('./files', {
        ...options,
        libSrc: join(normalize(options.projectRoot), 'src'),
        ts: 'ts',
        timestamp: options.timestamp || new Date().getTime(),
        camelize,
        underscore,
        pluralize,
        classify,
        capitalize,
        model: createModelOptions(options),
        config: createConfigOptions(options),
        ...dot.dot({ model: createModelOptions(options) }),
        ...dot.dot({ config: createConfigOptions(options) })
      }),
      createProviders(options, 'controllers', false),
      createProviders(options, 'entities', false),
      createProviders(options, 'services'),
      formatFiles()
    ])(tree, context);
  };
}
function addAppFiles(
  templateSource: string,
  options: NormalizedSchema | any
): Rule {
  return mergeWith(
    apply(url(templateSource), [
      template(options),
      move(
        join(
          normalize(options.workspace)
        )
      )
    ])
  );
}
function createModelOptions(options: NormalizedSchema) {
  const fileName = toFileName(
    options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.')
  );
  const srcFile = join(
    normalize(options.workspaceProjectRoot),
    'src',
    'models',
    fileName
  );
  const lowerName = underscore(options.name).split('_').join(' ').toLowerCase() + ' ';
  const upperName = capitalize(underscore(options.name).split('_').join(' ').toLowerCase()) + ' ';
  return {
    srcFile: srcFile + '.ts',
    lowerName,
    upperName
  };
}
function createConfigOptions(options: NormalizedSchema) {
  const fileName = toFileName(
    options.name
      .split('.')
      .map(word => dasherize(word))
      .join('.')
  );
  const srcFile = join(
    normalize(options.workspaceProjectRoot),
    'src',
    'configs',
    fileName
  );
  return {
    srcFile: srcFile + '.config.ts',
    fileName
  };
}
function createProviders(options: NormalizedSchema, typeName: string, asProviders = true): Rule {
  const fileName = toFileName('index');
  const srcPath = join(
    normalize(options.workspaceProjectRoot),
    'src',
    typeName.toLowerCase()
  );
  const srcFile = join(
    normalize(options.workspaceProjectRoot),
    'src',
    typeName.toLowerCase(),
    fileName
  );
  return updateFileInTree(srcFile + '.ts', (data: string, host: Tree) => {
    const project = new Project();
    project.manipulationSettings.set({
      insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
      quoteKind: QuoteKind.Single
    });
    host.getDir(srcPath).subfiles.forEach(key =>
      project.createSourceFile(
        '/' + join(srcPath, key),
        host.read('/' + join(srcPath, key)).toString('utf-8')
      )
    );
    project.addExistingSourceFiles(srcPath);

    const allImports = [];
    let allClasses = [];

    project
      .getSourceFiles()
      .filter((sourceFile, index) => sourceFile.getBaseName() !== 'index.ts')
      .forEach((sourceFile, index) => {
        const classes = sourceFile.getClasses();
        const classesNames = classes
          .filter((klass: ClassDeclaration) =>
            klass.hasExportKeyword()
          )
          .map(
            (klass: ClassDeclaration) =>
              klass.getName()
          );
        allClasses = [
          ...allClasses,
          ...classesNames
        ];
        allImports.push(
          `import { ${classesNames.join(
            ', '
          )} } from './${sourceFile.getBaseName().replace('.ts', '')}';`
        );
      });
    const newSourceFile = project.createSourceFile(
      'index.ts',
      (
        asProviders ? `import { Provider } from '@nestjs/common';
` : ''
      ) +
      `${allImports.join('\n')}

export const ${underscore(options.lib).toUpperCase()}_${typeName.toUpperCase()}${asProviders ? ': Provider[]' : ''} = [
    ${allClasses.map(provider => JSON.stringify(provider)).join(', ')}
  ]`
    );
    newSourceFile.fixMissingImports();
    const content = newSourceFile
      .getFullText()
      .replace(new RegExp('"', 'g'), '');
    return content;
  });
}

function normalizeOptions(tree: Tree, options: Schema): NormalizedSchema {
  const basePath = (<any>tree)._backend._root;

  const appDirectory = options.org
    ? `${toFileName(options.org)}/${toFileName(options.lib)}`
    : toFileName(options.lib);
  const appProjectRoot = join(
    normalize(options.workspace),
    'libs',
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
    org: options.org,
    appDirectory,
    workspaceProjectRoot: appProjectRoot,
    projectRoot: appProject,
    basePath
  };
}
