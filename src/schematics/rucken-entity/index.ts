import { join, normalize, Path } from '@angular-devkit/core';
import { apply, chain, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { addProviderToModule } from '@schematics/angular/utility/ast-utils';
import { InsertChange } from '@schematics/angular/utility/change';
import { pluralize } from 'inflection';
import { Project, QuoteKind, VariableStatement } from 'ts-morph';
import { readIntoSourceFile, updateFileInTree } from '../../utils/ast-utils';
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
      /*schematic('rucken-lib', {
        name: options.lib,
        org: options.org
      }),*/
      addAppFiles('./files', {
        ...options,
        libSrc: join(
          normalize(options.projectRoot),
          'src',
          'lib'
        ),
        ts: 'ts',
        timestamp: new Date().getTime(),
        camelize,
        underscore,
        pluralize,
        classify,
        capitalize,
        lowerName: underscore(options.name).split('_').join(' ').toLowerCase() + ' ',
        upperName: capitalize(underscore(options.name).split('_').join(' ').toLowerCase()) + ' '
      }),
      createProviders(options),
      importProvidersToModule(options),
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
function createProviders(options: NormalizedSchema): Rule {
  const fileName = toFileName('providers');
  const srcPath = join(
    normalize(options.workspaceProjectRoot),
    'src',
    'lib',
    'configs'
  );
  const srcFile = join(
    normalize(options.workspaceProjectRoot),
    'src',
    'lib',
    'configs',
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

    let allImports = [];
    let allProviders = [];

    project
      .getSourceFiles()
      .filter((sourceFile, index) => sourceFile.getBaseName() !== 'providers.ts')
      .forEach((sourceFile, index) => {
        const variableStatements = sourceFile.getVariableStatements();
        const variables = variableStatements
          .filter((variableStatement: VariableStatement) =>
            variableStatement.hasExportKeyword()
          )
          .map(
            (variableStatement: VariableStatement) =>
              variableStatement.getStructure().declarations[0]['name']
          );
        allProviders = [
          ...allProviders,
          ...variables
            .filter(
              variable =>
                variable.indexOf('DEFAULT_') !== 0 &&
                variables.filter(
                  subVariable =>
                    subVariable === `DEFAULT_${variable.replace('_TOKEN', '')}`
                ).length === 1
            )
            .map(variable => ({
              provide: variable,
              useValue: `DEFAULT_${variable.replace('_TOKEN', '')}`
            }))
        ];
        allImports.push(
          `import { ${variables.join(
            ', '
          )} } from './${sourceFile.getBaseName().replace('.ts', '')}';`
        );
      });

    allImports = allImports.filter((elem, index, self) => {
      return index === self.indexOf(elem);
    });
    allProviders = allProviders.filter((elem, index, self) => {
      return index === self.indexOf(elem);
    });

    const newSourceFile = project.createSourceFile(
      'providers.ts',
      `import { Provider } from '@angular/core';
${allImports.join('\n')}

export const ENTITIES_PROVIDERS: Provider[] = [
    ${allProviders.map(provider => JSON.stringify(provider)).join(', ')}
  ]`
    );
    newSourceFile.fixMissingImports();
    const content = newSourceFile
      .getFullText()
      .replace(new RegExp('"', 'g'), '');
    return content;
  });
}

function importProvidersToModule(options: NormalizedSchema): Rule {
  const fileName = toFileName('providers');
  const moduleName = toFileName(options.lib + '.module');
  const srcFile = join(
    normalize(options.workspaceProjectRoot),
    'src',
    'lib',
    'configs',
    fileName
  );
  const srcModuleFile = join(
    normalize(options.workspaceProjectRoot),
    'src',
    'lib',
    moduleName
  );
  return (host: Tree) => {
    const source = readIntoSourceFile(host, `/${srcModuleFile}.ts`);
    const declarationChanges = addProviderToModule(
      source,
      `/${srcModuleFile}.ts`,
      'ENTITIES_PROVIDERS',
      './configs/providers');
    const declarationRecorder = host.beginUpdate(`/${srcModuleFile}.ts`);
    for (const change of declarationChanges) {
      if (change instanceof InsertChange) {
        declarationRecorder.insertLeft(change.pos, change.toAdd);
      }
    }
    host.commitUpdate(declarationRecorder);
    return host;
  };
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
