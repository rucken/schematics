import { Path } from '@angular-devkit/core';
import { apply, chain, FileEntry, filter, forEach, mergeWith, move, Rule, SchematicContext, template, Tree, url } from '@angular-devkit/schematics';
import { serializeJson } from '../../utils/fileutils';
import { toFileName } from '../../utils/name-utils';
import { formatFiles } from '../../utils/rules/format-files';
import { classify, dasherize } from '../../utils/strings';
import { Schema } from './schema';

interface NormalizedSchema extends Schema {
  fullAuthorObject: {
    name: string,
    email: string
  };
  basePath: string;
}

function contentReplacer(options: NormalizedSchema) {
  const toRemoveStrings = [
  ];
  const toRemoveObject: any = {};
  toRemoveStrings.forEach(key => (toRemoveObject[key] = ''));
  return {
    ...toRemoveObject,
    'nx-rucken': options.name,
    'NxRucken': classify(options.name)
  };
}
function pathReplacer(options: NormalizedSchema) {
  return {
  };
}
function updateSourceFiles(
  path: string,
  content: string,
  options: NormalizedSchema
): string {
  let text;
  if (path === `/.gitignore`) {
    content = content
      .replace('/node_modules', 'node_modules');
    text = `

# Credentials
.travis/*.key
.travis/*.key.pub

# config
*.env

deploy
vendors
/schematics/src/**/*.js
/schematics/src/**/*.js.map`;
    content = content
      .replace(text, '') + text;
    return content;
  }
  if (path === '/.prettierignore') {
    text = `
*platform*
*plugin*
*www*`;
    content = content
      .replace(text, '') + text;
    return content;
  }
  if (path === `/tsconfig.json`) {
    const original = JSON.parse(content);
    if (!original.exclude) {
      original.exclude = ['scripts', 'node_modules', 'tmp'];
    }
    if (original.exclude.indexOf('scripts') === -1) {
      original.exclude = [
        'scripts',
        ...original.exclude
      ];
    }
    original.module = 'commonjs';
    return serializeJson(original);
  }
  if (path === `/package.json`) {
    const original = JSON.parse(content);
    original.engines = {
      'node': '>=11',
      'npm': '>=6.5.0'
    };
    original.author = options.fullAuthorObject;
    original.scripts['affected:prepare'] = 'rucken prepare';
    original.scripts['affected:dev'] = 'rucken prepare -m dev';
    original.scripts['affected:prod'] = 'rucken prepare -m prod';
    original.scripts['postinstall'] = 'sh ./scripts/postinstall.sh';
    original.scripts['typeorm'] = './node_modules/.bin/ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js';
    original.scripts['migrate:create'] = 'npm run typeorm migration:create';
    original.scripts['migrate:generate'] = 'npm run typeorm migration:generate';
    original.scripts['migrate:prod'] = 'cross-env MIGRATIONS=true NODE_ENV=production npm run typeorm migration:run';
    original.scripts['migrate'] = 'cross-env MIGRATIONS=true npm run typeorm migration:run';
    return serializeJson(original);
  }
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
    `../../../files/workspace`.replace('{basePath}', options.basePath)
  ];
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
function addAppFiles(
  templateSource: string,
  tree: Tree,
  options: NormalizedSchema
): Rule {
  return mergeWith(
    apply(url(templateSource), [
      filter(path => filterFiles(path)),
      template({
        name: options.name
      }),
      forEach((fileEntry: FileEntry) => {
        return updateFileFileEntry(tree, fileEntry, options);
      }),
      move(options.workspace || options.name)
    ])
  );
}
export default function (schema: any): Rule {
  return (tree: Tree, context: SchematicContext) => {
    const options = normalizeOptions(tree, schema);
    return chain([
      ...(
        templateSources(options).map(templateSource =>
          addAppFiles(templateSource, tree, options)
        )
      ),
      formatFiles()
    ])(tree, context);
  };
}
function normalizeOptions(tree: Tree, options: Schema): NormalizedSchema {
  const basePath = (<any>tree)._backend._root;

  return {
    ...options,
    fullAuthorObject: {
      name: options.author,
      email: options.email
    },
    name: toFileName(
      options.name
        .split('.')
        .map(word => dasherize(word))
        .join('.')
    ),
    basePath
  };
}
