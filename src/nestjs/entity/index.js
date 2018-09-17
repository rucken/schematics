"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@angular-devkit/core");
const schematics_1 = require("@angular-devkit/schematics");
const fs_1 = require("fs");
const inflection_1 = require("inflection");
const path_1 = require("path");
const dot = require('dot-object');
const gitEmail = require('git-user-email');
const gitUsername = require('git-username');
// Instead of `any`, it would make sense here to get a schema-to-dts package and output the
// interfaces so you get type-safe options.
function default_1(options) {
    const root = options.root;
    const name = options.name;
    const fields = options.fields.replace(new RegExp('\\[', 'g'), '').replace(new RegExp('\\]', 'g'), '').replace(new RegExp('\"', 'g'), '').split(',').map((field) => field.trim());
    const gitInfo = { username: options.username || gitUsername(), email: options.email || gitEmail() };
    const chains = [];
    let app = options.app;
    let core = options.core;
    let nestCliConfig;
    let time = options.time;
    let apps;
    let libs;
    let nestCliConfigPath = path_1.resolve(root, '.nestcli.json');
    try {
        fs_1.accessSync(nestCliConfigPath, fs_1.constants.F_OK);
    }
    catch (e) {
        nestCliConfigPath = path_1.resolve(__dirname, 'files', 'project', '.nestcli.__json__');
        chains.push(schematics_1.schematic('nestjs-new', { root: root, name: 'demo', username: gitInfo.username, email: gitInfo.email }));
    }
    try {
        nestCliConfig = JSON.parse(fs_1.readFileSync(nestCliConfigPath).toString());
    }
    catch (error) {
        throw new schematics_1.SchematicsException('Wrong body of file .nestcli.json');
    }
    apps = Object.keys(nestCliConfig.projects).filter(key => nestCliConfig.projects[key] && nestCliConfig.projects[key].projectType === 'application');
    libs = Object.keys(nestCliConfig.projects).filter(key => nestCliConfig.projects[key] && nestCliConfig.projects[key].projectType === 'library');
    if (!app) {
        app = apps[0];
    }
    if (!core) {
        core = libs[0] ? libs[0] : app;
    }
    const appConfig = Object.assign({ name: app }, nestCliConfig.projects[app]);
    const appConfigs = apps.map(key => (Object.assign({ name: key }, nestCliConfig.projects[key])));
    const coreConfig = Object.assign({ name: core }, nestCliConfig.projects[core]);
    const libConfigs = libs.map(key => (Object.assign({ name: key }, nestCliConfig.projects[key])));
    const data = Object.assign({ time: time ? time : new Date().getTime() }, core_1.strings, { humanize: (str, low_first_letter) => inflection_1.humanize(inflection_1.underscore(str).replace(new RegExp('-', 'g'), ' '), low_first_letter), snakecase: (str, uppercase) => inflection_1.underscore(uppercase ? str.toUpperCase() : str, true).replace(new RegExp('-', 'g'), '_'), underscore: inflection_1.underscore, pluralize: inflection_1.pluralize, name: name, fields: fields, root: root, gitInfo: gitInfo }, dot.dot({ gitInfo: gitInfo }), { app: appConfig, core: coreConfig, apps: appConfigs, libs: libConfigs }, dot.dot({ app: appConfig }), dot.dot({ core: coreConfig }), dot.dot({ apps: appConfigs }), dot.dot({ libs: libConfigs }), { js: 'js', ts: 'ts', gitignore: 'gitignore', json: 'json', env: 'env' });
    let controllersPath = path_1.resolve(root, data.app.sourceRoot, 'controllers');
    let servicesPath = path_1.resolve(root, data.app.sourceRoot, 'services');
    let entitiesPath = path_1.resolve(root, data.app.sourceRoot, 'entities');
    let existsControllers;
    let existsServices;
    let existsEntities;
    try {
        existsControllers = fs_1.readdirSync(controllersPath).filter(f => fs_1.statSync(path_1.join(controllersPath, f)).isFile() && f.indexOf('.controller.ts') !== -1).map(f => f.replace('.controller.ts', ''));
    }
    catch (error) {
        existsControllers = [];
    }
    try {
        existsServices = fs_1.readdirSync(servicesPath).filter(f => fs_1.statSync(path_1.join(servicesPath, f)).isFile() && f.indexOf('.service.ts') !== -1).map(f => f.replace('.service.ts', ''));
    }
    catch (error) {
        existsServices = [];
    }
    try {
        existsEntities = fs_1.readdirSync(entitiesPath).filter(f => fs_1.statSync(path_1.join(entitiesPath, f)).isFile() && f.indexOf('.entity.ts') !== -1).map(f => f.replace('.entity.ts', ''));
    }
    catch (error) {
        existsEntities = [];
    }
    if (existsControllers.indexOf(data.pluralize(name)) === -1) {
        existsControllers.push(data.pluralize(name));
    }
    if (existsServices.indexOf(data.pluralize(name)) === -1) {
        existsServices.push(data.pluralize(name));
    }
    if (existsEntities.indexOf(name) === -1) {
        existsEntities.push(name);
    }
    existsControllers = existsControllers.sort();
    existsServices = existsServices.sort();
    existsEntities = existsEntities.sort();
    try {
        const templateSource = schematics_1.apply(schematics_1.url('./files/libs'), [
            schematics_1.template(Object.assign({}, data, { controllers: existsControllers, services: existsServices, entities: existsEntities }))
        ]);
        chains.push(schematics_1.mergeWith(templateSource, schematics_1.MergeStrategy.Overwrite));
    }
    catch (e) {
    }
    const moduleFile = path_1.resolve(root, data.app.sourceRoot, data.decamelize(data.app.name) + '.module.ts');
    try {
        fs_1.accessSync(moduleFile, fs_1.constants.F_OK);
    }
    catch (e) {
        const templateModuleSource = schematics_1.apply(schematics_1.url('./files/only-module'), [
            schematics_1.template(data)
        ]);
        chains.push(schematics_1.mergeWith(templateModuleSource, schematics_1.MergeStrategy.Overwrite));
    }
    const configFile = path_1.resolve(root, data.app.sourceRoot, 'configs', 'index.ts');
    try {
        fs_1.accessSync(configFile, fs_1.constants.F_OK);
    }
    catch (e) {
        const templateConfigSource = schematics_1.apply(schematics_1.url('./files/only-configs'), [
            schematics_1.template(data)
        ]);
        chains.push(schematics_1.mergeWith(templateConfigSource, schematics_1.MergeStrategy.Overwrite));
    }
    // The chain rule allows us to chain multiple rules and apply them one after the other.
    return schematics_1.chain(chains);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map