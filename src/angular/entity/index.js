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
    let web = options.web;
    let angularConfig;
    let app1 = '';
    let lib1 = '';
    let lib2 = '';
    let angularConfigPath = path_1.resolve(root, 'angular.json');
    try {
        fs_1.accessSync(angularConfigPath, fs_1.constants.F_OK);
    }
    catch (e) {
        angularConfigPath = path_1.resolve(__dirname, 'files', 'project', 'angular.__json__');
        chains.push(schematics_1.schematic('angular-new', { root: root, name: 'demo', username: gitInfo.username, email: gitInfo.email }));
    }
    try {
        angularConfig = JSON.parse(fs_1.readFileSync(angularConfigPath).toString());
    }
    catch (error) {
        throw new schematics_1.SchematicsException('Wrong body of file angilar.json');
    }
    Object.keys(angularConfig.projects).forEach(key => (!app1 && angularConfig.projects[key] && angularConfig.projects[key].projectType === 'application') ? app1 = key : null);
    Object.keys(angularConfig.projects).forEach(key => (!lib1 && angularConfig.projects[key] && angularConfig.projects[key].projectType === 'library') ? lib1 = key : null);
    Object.keys(angularConfig.projects).forEach(key => (key !== lib1 && !lib2 && angularConfig.projects[key] && angularConfig.projects[key].projectType === 'library') ? lib2 = key : null);
    if (!app) {
        app = app1;
    }
    if (!core) {
        core = lib1 ? lib1 : app;
    }
    if (!web) {
        web = lib2 ? lib2 : core;
    }
    const appConfig = Object.assign({ name: app }, angularConfig.projects[app]);
    const coreConfig = Object.assign({ name: core }, angularConfig.projects[core]);
    const webConfig = Object.assign({ name: web }, angularConfig.projects[web]);
    const data = Object.assign({}, core_1.strings, { humanize: (str, low_first_letter) => inflection_1.humanize(inflection_1.underscore(str).replace(new RegExp('-', 'g'), ' '), low_first_letter), snakecase: (str, uppercase) => inflection_1.underscore(uppercase ? str.toUpperCase() : str, true).replace(new RegExp('-', 'g'), '_'), underscore: inflection_1.underscore, pluralize: inflection_1.pluralize, name: name, fields: fields, root: root, gitInfo: gitInfo }, dot.dot({ gitInfo: gitInfo }), { app: appConfig, core: coreConfig, web: webConfig }, dot.dot({ app: appConfig }), dot.dot({ core: coreConfig }), dot.dot({ web: webConfig }), { js: 'js', ts: 'ts', gitignore: 'gitignore', json: 'json', env: 'env' });
    const templateLibsSource = schematics_1.apply(schematics_1.url('./files/libs'), [
        schematics_1.template(data)
    ]);
    chains.push(schematics_1.mergeWith(templateLibsSource, schematics_1.MergeStrategy.Overwrite));
    const frameModuleFile = path_1.resolve(root, data.app.sourceRoot, 'app', 'pages', 'entities-page', data.pluralize(data.name), data.pluralize(data.name) + '-frame.module.ts');
    try {
        fs_1.accessSync(frameModuleFile, fs_1.constants.F_OK);
    }
    catch (e) {
        const templateFrameSource = schematics_1.apply(schematics_1.url('./files/frame'), [
            schematics_1.template(data)
        ]);
        chains.push(schematics_1.mergeWith(templateFrameSource, schematics_1.MergeStrategy.Overwrite));
    }
    const entitiesPagePath = path_1.resolve(root, data.app.sourceRoot, 'app', 'pages', 'entities-page');
    const entityPageModuleFile = path_1.resolve(root, data.app.sourceRoot, 'app', 'pages', 'entities-page', 'entities-page.module.ts');
    let existsFrames;
    try {
        existsFrames = fs_1.readdirSync(entitiesPagePath).filter(f => fs_1.statSync(path_1.join(entitiesPagePath, f)).isDirectory() && f.indexOf('-frame') !== -1).map(f => f.replace('-frame', ''));
    }
    catch (error) {
        existsFrames = [
            'content-types',
            'groups',
            'permissions',
            'users'
        ];
    }
    if (existsFrames.indexOf(data.pluralize(name)) === -1) {
        existsFrames.push(data.pluralize(name));
    }
    existsFrames = existsFrames.sort();
    try {
        fs_1.accessSync(entityPageModuleFile, fs_1.constants.F_OK);
        const templatePageSource = schematics_1.apply(schematics_1.url('./files/page-only-routes'), [
            schematics_1.template(Object.assign({}, data, { frames: existsFrames }))
        ]);
        chains.push(schematics_1.mergeWith(templatePageSource, schematics_1.MergeStrategy.Overwrite));
    }
    catch (e) {
        const templatePageSource = schematics_1.apply(schematics_1.url('./files/page'), [
            schematics_1.template(Object.assign({}, data, { frames: existsFrames }))
        ]);
        chains.push(schematics_1.mergeWith(templatePageSource, schematics_1.MergeStrategy.Overwrite));
    }
    ///
    const modelsConfigsPath = path_1.resolve(root, data.core.sourceRoot, 'lib', 'entities', 'configs');
    let existsConfigs;
    try {
        existsConfigs = fs_1.readdirSync(modelsConfigsPath).filter(f => fs_1.statSync(path_1.join(modelsConfigsPath, f)).isFile() && f.indexOf('.config.ts') !== -1).map(f => f.replace('.config.ts', ''));
    }
    catch (error) {
        existsConfigs = [];
    }
    if (existsConfigs.indexOf(data.pluralize(name)) === -1) {
        existsConfigs.push(name);
    }
    existsConfigs = existsConfigs.sort();
    const templateConfigsSource = schematics_1.apply(schematics_1.url('./files/configs-provider'), [
        schematics_1.template(Object.assign({}, data, { models: existsConfigs }))
    ]);
    chains.push(schematics_1.mergeWith(templateConfigsSource, schematics_1.MergeStrategy.Overwrite));
    // The chain rule allows us to chain multiple rules and apply them one after the other.
    return schematics_1.chain(chains);
}
exports.default = default_1;
//# sourceMappingURL=index.js.map