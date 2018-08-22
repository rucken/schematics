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
    options.fields.replace(new RegExp('\\[', 'g'), '').replace(new RegExp('\\]', 'g'), '').replace(new RegExp('\"', 'g'), '').split(',');
  const gitInfo = { username: options.username || gitUsername(), email: options.email || gitEmail() };
  const chains = [];
  let app = options.app;
  let core = options.core;
  let nestCliConfig: any;
  let apps: string[];
  let libs: string[];
  let nestCliConfigPath = resolve(root, '.nestcli.json');
  try {
    accessSync(nestCliConfigPath, constants.F_OK);
  } catch (e) {
    nestCliConfigPath = resolve(__dirname, 'files', 'project', '.nestcli.__json__');
    chains.push(
      schematic('nestjs-new', { root: root, name: 'demo', username: gitInfo.username, email: gitInfo.email })
    )
  }
  try {
    nestCliConfig = JSON.parse(readFileSync(nestCliConfigPath).toString());
  } catch (error) {
    throw new SchematicsException('Wrong body of file .nestcli.json')
  }
  apps = Object.keys(nestCliConfig.projects).filter(key =>
    nestCliConfig.projects[key] && nestCliConfig.projects[key].projectType === 'application'
  );
  libs = Object.keys(nestCliConfig.projects).filter(key =>
    nestCliConfig.projects[key] && nestCliConfig.projects[key].projectType === 'library'
  );
  if (!app) {
    app = apps[0];
  }
  if (!core) {
    core = libs[0] ? libs[0] : app;
  }
  const appConfig = {
    name: app,
    ...nestCliConfig.projects[app]
  };
  const appConfigs = apps.map(key => ({
    name: key,
    ...nestCliConfig.projects[key]
  }));
  const coreConfig = {
    name: core,
    ...nestCliConfig.projects[core]
  };
  const libConfigs = libs.map(key => ({
    name: key,
    ...nestCliConfig.projects[key]
  }));
  const data = {
    ...strings,
    humanize: (str: string, low_first_letter?: boolean) =>
      humanize(
        underscore(str).replace(new RegExp('-', 'g'), ' '),
        low_first_letter
      ),
    pluralize: pluralize,
    name: name,
    fields: fields,
    root: root,
    gitInfo: gitInfo,
    ...dot.dot({ gitInfo: gitInfo }),
    app: appConfig,
    core: coreConfig,
    apps: appConfigs,
    libs: libConfigs,
    ...dot.dot({ app: appConfig }),
    ...dot.dot({ core: coreConfig }),
    ...dot.dot({ apps: appConfigs }),
    ...dot.dot({ libs: libConfigs }),
    ts: 'ts',
    json: 'json'
  };
  let controllersPath = resolve(root, data.app.sourceRoot, 'controllers');
  let servicesPath = resolve(root, data.app.sourceRoot, 'services');
  let entitiesPath = resolve(root, data.app.sourceRoot, 'entities');
  let existsControllers: string[];
  let existsServices: string[];
  let existsEntities: string[];
  try {
    existsControllers = readdirSync(controllersPath).filter(f =>
      statSync(join(controllersPath, f)).isFile() && f.indexOf('.controller.ts') !== -1
    ).map(f => f.replace('.controller.ts', ''));
  } catch (error) {
    existsControllers = [
    ];
  }
  try {
    existsServices = readdirSync(servicesPath).filter(f =>
      statSync(join(servicesPath, f)).isFile() && f.indexOf('.service.ts') !== -1
    ).map(f => f.replace('.service.ts', ''));
  } catch (error) {
    existsServices = [
    ];
  }
  try {
    existsEntities = readdirSync(entitiesPath).filter(f =>
      statSync(join(entitiesPath, f)).isFile() && f.indexOf('.entity.ts') !== -1
    ).map(f => f.replace('.entity.ts', ''));
  } catch (error) {
    existsEntities = [
    ];
  }
  if (existsControllers.indexOf(data.pluralize(name)) === -1) {
    existsControllers.push(
      data.pluralize(name)
    );
  }
  if (existsServices.indexOf(data.pluralize(name)) === -1) {
    existsServices.push(
      data.pluralize(name)
    );
  }
  if (existsEntities.indexOf(name) === -1) {
    existsEntities.push(
      name
    );
  }
  existsControllers = existsControllers.sort();
  existsServices = existsServices.sort();
  existsEntities = existsEntities.sort();
  try {
    const templateSource = apply(url('./files/libs'), [
      template({
        ...data,
        controllers: existsControllers,
        services: existsServices,
        entities: existsEntities
      })
    ]);
    chains.push(
      mergeWith(templateSource, MergeStrategy.Overwrite)
    );
  } catch (e) {
  }
  const moduleFile =
    resolve(root, data.app.sourceRoot, data.decamelize(data.camelize(data.app.name)) + '.module.ts');
  try {
    accessSync(moduleFile, constants.F_OK);
  } catch (e) {
    const templateModuleSource = apply(url('./files/only-module'), [
      template(data)
    ]);
    chains.push(
      mergeWith(templateModuleSource, MergeStrategy.Overwrite)
    );
  }
  const configFile =
    resolve(root, data.app.sourceRoot, 'configs', 'index.ts');
  try {
    accessSync(configFile, constants.F_OK);
  } catch (e) {
    const templateConfigSource = apply(url('./files/only-configs'), [
      template(data)
    ]);
    chains.push(
      mergeWith(templateConfigSource, MergeStrategy.Overwrite)
    );
  }
  // The chain rule allows us to chain multiple rules and apply them one after the other.
  return chain(chains);
}
