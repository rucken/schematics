import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, Rule, schematic, SchematicsException, template, url } from '@angular-devkit/schematics';
import { accessSync, constants, readdirSync, readFileSync, statSync } from 'fs';
import { humanize, pluralize, underscore } from 'inflection';
import { join, resolve } from 'path';

const dot = require('dot-object');
const gitEmail = require('git-user-email');
const gitUsername = require('git-username');

// Instead of `any`, it would make sense here to get a schema-to-dts package and output the
// interfaces so you get type-safe options.
export default function (options: any): Rule {
  const root = options.root;
  const name = options.name;
  const fields =
    options.fields.replace(new RegExp('\\[', 'g'), '').replace(new RegExp('\\]', 'g'), '').replace(new RegExp('\"', 'g'), '').split(',').map((field: string) => field.trim());
  const gitInfo = { username: options.username || gitUsername(), email: options.email || gitEmail() };
  const chains = [];
  let app = options.app;
  let core = options.core;
  let web = options.web;
  let angularConfig: any;
  let app1: string = '';
  let lib1: string = '';
  let lib2: string = '';
  let angularConfigPath = resolve(root, 'angular.json');
  try {
    accessSync(angularConfigPath, constants.F_OK);
  } catch (e) {
    angularConfigPath = resolve(__dirname, 'files', 'project', 'angular.__json__');
    chains.push(
      schematic('angular-new', { root: root, name: 'demo', username: gitInfo.username, email: gitInfo.email })
    )
  }
  try {
    angularConfig = JSON.parse(readFileSync(angularConfigPath).toString());
  } catch (error) {
    throw new SchematicsException('Wrong body of file angilar.json')
  }
  Object.keys(angularConfig.projects).forEach(key =>
    (!app1 && angularConfig.projects[key] && angularConfig.projects[key].projectType === 'application') ? app1 = key : null
  );
  Object.keys(angularConfig.projects).forEach(key =>
    (!lib1 && angularConfig.projects[key] && angularConfig.projects[key].projectType === 'library') ? lib1 = key : null
  );
  Object.keys(angularConfig.projects).forEach(key =>
    (key !== lib1 && !lib2 && angularConfig.projects[key] && angularConfig.projects[key].projectType === 'library') ? lib2 = key : null
  );
  if (!app) {
    app = app1;
  }
  if (!core) {
    core = lib1 ? lib1 : app;
  }
  if (!web) {
    web = lib2 ? lib2 : core;
  }
  const appConfig = {
    name: app,
    ...angularConfig.projects[app]
  };
  const coreConfig = {
    name: core,
    ...angularConfig.projects[core]
  };
  const webConfig = {
    name: web,
    ...angularConfig.projects[web]
  };
  const data = {
    ...strings,
    humanize: (str: string, low_first_letter?: boolean) =>
      humanize(
        underscore(str).replace(new RegExp('-', 'g'), ' '),
        low_first_letter
      ),
    snakecase: (str: string, uppercase?: boolean) =>
      underscore(uppercase ? str.toUpperCase() : str, true).replace(new RegExp('-', 'g'), '_'),
    underscore: underscore,
    pluralize: pluralize,
    name: name,
    fields: fields,
    root: root,
    gitInfo: gitInfo,
    ...dot.dot({ gitInfo: gitInfo }),
    app: appConfig,
    core: coreConfig,
    web: webConfig,
    ...dot.dot({ app: appConfig }),
    ...dot.dot({ core: coreConfig }),
    ...dot.dot({ web: webConfig }),
    js: 'js',
    ts: 'ts',
    gitignore: 'gitignore',
    json: 'json',
    env: 'env'
  };
  const templateLibsSource = apply(url('./files/libs'), [
    template(data)
  ]);
  chains.push(
    mergeWith(templateLibsSource, MergeStrategy.Overwrite)
  );

  const frameModuleFile =
    resolve(root, data.app.sourceRoot, 'app', 'pages', 'entities-page', data.pluralize(data.name), data.pluralize(data.name) + '-frame.module.ts');
  try {
    accessSync(frameModuleFile, constants.F_OK);
  } catch (e) {
    const templateFrameSource = apply(url('./files/frame'), [
      template(data)
    ]);
    chains.push(
      mergeWith(templateFrameSource, MergeStrategy.Overwrite)
    );
  }
  const entitiesPagePath: string =
    resolve(root, data.app.sourceRoot, 'app', 'pages', 'entities-page');
  const entityPageModuleFile =
    resolve(root, data.app.sourceRoot, 'app', 'pages', 'entities-page', 'entities-page.module.ts');
  let existsFrames: string[];
  try {
    existsFrames = readdirSync(entitiesPagePath).filter(f =>
      statSync(join(entitiesPagePath, f)).isDirectory() && f.indexOf('-frame') !== -1
    ).map(f => f.replace('-frame', ''));
  } catch (error) {
    existsFrames = [
      'content-types',
      'groups',
      'permissions',
      'users'
    ];
  }
  if (existsFrames.indexOf(data.pluralize(name)) === -1) {
    existsFrames.push(
      data.pluralize(name)
    );
  }
  existsFrames = existsFrames.sort();
  try {
    accessSync(entityPageModuleFile, constants.F_OK);
    const templatePageSource = apply(url('./files/page-only-routes'), [
      template({ ...data, frames: existsFrames })
    ]);
    chains.push(
      mergeWith(templatePageSource, MergeStrategy.Overwrite)
    );
  } catch (e) {
    const templatePageSource = apply(url('./files/page'), [
      template({ ...data, frames: existsFrames })
    ]);
    chains.push(
      mergeWith(templatePageSource, MergeStrategy.Overwrite)
    );
  }
  ///
  const modelsConfigsPath: string =
    resolve(root, data.core.sourceRoot, 'lib', 'entities', 'configs');
  let existsConfigs: string[];
  try {
    existsConfigs = readdirSync(modelsConfigsPath).filter(f =>
      statSync(join(modelsConfigsPath, f)).isFile() && f.indexOf('.config.ts') !== -1
    ).map(f => f.replace('.config.ts', ''));
  } catch (error) {
    existsConfigs = [
    ];
  }
  if (existsConfigs.indexOf(data.pluralize(name)) === -1) {
    existsConfigs.push(
      name
    );
  }
  existsConfigs = existsConfigs.sort();
  const templateConfigsSource = apply(url('./files/configs-provider'), [
    template({ ...data, models: existsConfigs })
  ]);
  chains.push(
    mergeWith(templateConfigsSource, MergeStrategy.Overwrite)
  );
  // The chain rule allows us to chain multiple rules and apply them one after the other.
  return chain(chains);
}
