# @rucken/schematics

[![Greenkeeper badge](https://badges.greenkeeper.io/rucken/schematics.svg)](https://greenkeeper.io/)
[![NPM version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]
[![Gitter][gitter-image]][gitter-url]
[![Join the chat at telegram][telegram-image]][telegram-url]

A schematics collections for generate source files for [Angular7+](https://angular.io/) and [NestJS](https://nestjs.com/) application based on [Rucken](https://github.com/rucken)  template

<!-- generators -->

* [Install](#install)
* [Usage](#usage)
* [Available generators](#available-generators)

# Install
<!-- install -->
```bash
npm install -g @angular-devkit/schematics-cli
npm install -g @rucken/schematics
```
<!-- installstop -->

# Usage
<!-- usage -->
```bash
# create workspace
schematics @rucken/schematics:workspace custom-workspace --author EndyKaufman --email admin@site15.ru
# move to created workspace
cd custom-workspace
# create frontend application in workspace
schematics @rucken/schematics:rucken-app custom-app --api=/api --author EndyKaufman --email admin@site15.ru
# install dependencies
npm i
# start dev server for frontend application
ng serve custom-app
```
<!-- usagestop -->

# Available generators
* [Rucken app](#rucken-app) - Frontend application generator on Angular7+ with Bootstrap3, based on the Rucken template
* [Rucken app ionic](#rucken-app-ionic) - Mobile frontend generator application on Angular7+ with Ionic4, based on the Rucken template
* [Rucken app nestjs](#rucken-app-nestjs) - REST generator backend applications on NestJS with TypeORM, based on the Rucken template
* [Rucken entity](#rucken-entity) - Model generator and frontend application, based on the Rucken template
* [Rucken entity ionic](#rucken-entity-ionic) - The generator of the main components for editing data on the model and for a mobile frontend application on Angular7+ with Ionic4, based on the Rucken template
* [Rucken entity ionic to app](#rucken-entity-ionic-to-app) - Binding components for editing an entity to a mobile frontend application on Angular7+ with Ionic4, based on the Rucken template
* [Rucken entity nestjs](#rucken-entity-nestjs) - The generator of the entity, the DTO, the service and the controller, for editing the entity data for the backend of the application on NestJS with TypeORM, based on the Rucken template
* [Rucken entity web](#rucken-entity-web) - The generator of the main components for editing data on the model and for the frontend application on Angular7+ with Bootstrap3, based on the Rucken template
* [Rucken entity web to app](#rucken-entity-web-to-app) - Binding of components for editing an entity to a frontend application on Angular7+ with Bootstrap3, based on the Rucken template
* [Rucken lib](#rucken-lib) - Frontend library generator, based on the Rucken template
* [Rucken lib nestjs](#rucken-lib-nestjs) - Backend library generator on NestJS, based on the Rucken template
* [Rucken lib nestjs to app](#rucken-lib-nestjs-to-app) - Linking the library to the backend application on NestJS, based on the Rucken template
* [Rucken lib to app](#rucken-lib-to-app) - Linking the library to the frontend application on Angular7+, based on the Rucken template
* [Workspace](#workspace) - Workspace generator, based on the Rucken template
## Rucken app
Frontend application generator on Angular7+ with Bootstrap3, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-app custom-app --api=/api --author EndyKaufman --email admin@site15.ru
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the application. | {"$source":"argv","index":0} |
| org | {string} | The name of organization. | none |
| api | {string} | The backend api address (/api, http://host.com/api, https://api.host.com). | none |
| author | {string} | Author name. | none |
| email | {string} | Author email name. | none |

### Dependencies
| Name | Used | Current |
| ------ | ------ | ------ |
| [@angular/core](https://www.npmjs.com/package/@angular/core) | [![NPM version](https://img.shields.io/badge/npm_package-7.2.12-9cf.svg)](https://www.npmjs.com/package/@angular/core) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcore.svg)](https://www.npmjs.com/package/@angular/core) |
| [@nguniversal/express-engine](https://www.npmjs.com/package/@nguniversal/express-engine) | [![NPM version](https://img.shields.io/badge/npm_package-7.1.1-9cf.svg)](https://www.npmjs.com/package/@nguniversal/express-engine) | [![NPM version](https://badge.fury.io/js/%40nguniversal%2Fexpress-engine.svg)](https://www.npmjs.com/package/@nguniversal/express-engine) |
| [@ngx-meta/core](https://www.npmjs.com/package/@ngx-meta/core) | [![NPM version](https://img.shields.io/badge/npm_package-7.0.0-9cf.svg)](https://www.npmjs.com/package/@ngx-meta/core) | [![NPM version](https://badge.fury.io/js/%40ngx-meta%2Fcore.svg)](https://www.npmjs.com/package/@ngx-meta/core) |
| [@ngx-translate/core](https://www.npmjs.com/package/@ngx-translate/core) | [![NPM version](https://img.shields.io/badge/npm_package-11.0.1-9cf.svg)](https://www.npmjs.com/package/@ngx-translate/core) | [![NPM version](https://badge.fury.io/js/%40ngx-translate%2Fcore.svg)](https://www.npmjs.com/package/@ngx-translate/core) |
| [@rucken/core](https://www.npmjs.com/package/@rucken/core) | [![NPM version](https://img.shields.io/badge/npm_package-3.9.12-9cf.svg)](https://www.npmjs.com/package/@rucken/core) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fcore.svg)](https://www.npmjs.com/package/@rucken/core) |
| [@rucken/web](https://www.npmjs.com/package/@rucken/web) | [![NPM version](https://img.shields.io/badge/npm_package-3.9.12-9cf.svg)](https://www.npmjs.com/package/@rucken/web) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fweb.svg)](https://www.npmjs.com/package/@rucken/web) |
| [bind-observable](https://www.npmjs.com/package/bind-observable) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.2-9cf.svg)](https://www.npmjs.com/package/bind-observable) | [![NPM version](https://badge.fury.io/js/bind-observable.svg)](https://www.npmjs.com/package/bind-observable) |
| [ngx-bind-io](https://www.npmjs.com/package/ngx-bind-io) | [![NPM version](https://img.shields.io/badge/npm_package-0.6.6-9cf.svg)](https://www.npmjs.com/package/ngx-bind-io) | [![NPM version](https://badge.fury.io/js/ngx-bind-io.svg)](https://www.npmjs.com/package/ngx-bind-io) |
| [ngx-bootstrap](https://www.npmjs.com/package/ngx-bootstrap) | [![NPM version](https://img.shields.io/badge/npm_package-3.2.0-9cf.svg)](https://www.npmjs.com/package/ngx-bootstrap) | [![NPM version](https://badge.fury.io/js/ngx-bootstrap.svg)](https://www.npmjs.com/package/ngx-bootstrap) |
| [ngx-cookie-service](https://www.npmjs.com/package/ngx-cookie-service) | [![NPM version](https://img.shields.io/badge/npm_package-2.1.0-9cf.svg)](https://www.npmjs.com/package/ngx-cookie-service) | [![NPM version](https://badge.fury.io/js/ngx-cookie-service.svg)](https://www.npmjs.com/package/ngx-cookie-service) |
| [ngx-dynamic-form-builder](https://www.npmjs.com/package/ngx-dynamic-form-builder) | [![NPM version](https://img.shields.io/badge/npm_package-0.9.0-9cf.svg)](https://www.npmjs.com/package/ngx-dynamic-form-builder) | [![NPM version](https://badge.fury.io/js/ngx-dynamic-form-builder.svg)](https://www.npmjs.com/package/ngx-dynamic-form-builder) |
| [ngx-permissions](https://www.npmjs.com/package/ngx-permissions) | [![NPM version](https://img.shields.io/badge/npm_package-6.0.5-9cf.svg)](https://www.npmjs.com/package/ngx-permissions) | [![NPM version](https://badge.fury.io/js/ngx-permissions.svg)](https://www.npmjs.com/package/ngx-permissions) |
| [ngx-repository](https://www.npmjs.com/package/ngx-repository) | [![NPM version](https://img.shields.io/badge/npm_package-0.6.3-9cf.svg)](https://www.npmjs.com/package/ngx-repository) | [![NPM version](https://badge.fury.io/js/ngx-repository.svg)](https://www.npmjs.com/package/ngx-repository) |

### Dev dependencies
| Name | Used | Current |
| ------ | ------ | ------ |
| [@angular-devkit/build-angular](https://www.npmjs.com/package/@angular-devkit/build-angular) | [![NPM version](https://img.shields.io/badge/npm_package-0.13.8-9cf.svg)](https://www.npmjs.com/package/@angular-devkit/build-angular) | [![NPM version](https://badge.fury.io/js/%40angular-devkit%2Fbuild-angular.svg)](https://www.npmjs.com/package/@angular-devkit/build-angular) |
| [@angular/cli](https://www.npmjs.com/package/@angular/cli) | [![NPM version](https://img.shields.io/badge/npm_package-7.3.8-9cf.svg)](https://www.npmjs.com/package/@angular/cli) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcli.svg)](https://www.npmjs.com/package/@angular/cli) |
| [@angular/compiler-cli](https://www.npmjs.com/package/@angular/compiler-cli) | [![NPM version](https://img.shields.io/badge/npm_package-7.2.12-9cf.svg)](https://www.npmjs.com/package/@angular/compiler-cli) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcompiler-cli.svg)](https://www.npmjs.com/package/@angular/compiler-cli) |
| [@compodoc/compodoc](https://www.npmjs.com/package/@compodoc/compodoc) | [![NPM version](https://img.shields.io/badge/npm_package-1.1.9-9cf.svg)](https://www.npmjs.com/package/@compodoc/compodoc) | [![NPM version](https://badge.fury.io/js/%40compodoc%2Fcompodoc.svg)](https://www.npmjs.com/package/@compodoc/compodoc) |
| [@rucken/cli](https://www.npmjs.com/package/@rucken/cli) | [![NPM version](https://img.shields.io/badge/npm_package-3.3.3-9cf.svg)](https://www.npmjs.com/package/@rucken/cli) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fcli.svg)](https://www.npmjs.com/package/@rucken/cli) |
| [domino](https://www.npmjs.com/package/domino) | [![NPM version](https://img.shields.io/badge/npm_package-2.1.3-9cf.svg)](https://www.npmjs.com/package/domino) | [![NPM version](https://badge.fury.io/js/domino.svg)](https://www.npmjs.com/package/domino) |
| [ts-node](https://www.npmjs.com/package/ts-node) | [![NPM version](https://img.shields.io/badge/npm_package-8.0.2-9cf.svg)](https://www.npmjs.com/package/ts-node) | [![NPM version](https://badge.fury.io/js/ts-node.svg)](https://www.npmjs.com/package/ts-node) |
| [tslib](https://www.npmjs.com/package/tslib) | [![NPM version](https://img.shields.io/badge/npm_package-1.9.3-9cf.svg)](https://www.npmjs.com/package/tslib) | [![NPM version](https://badge.fury.io/js/tslib.svg)](https://www.npmjs.com/package/tslib) |
| [typescript](https://www.npmjs.com/package/typescript) | [![NPM version](https://img.shields.io/badge/npm_package-3.2.4-9cf.svg)](https://www.npmjs.com/package/typescript) | [![NPM version](https://badge.fury.io/js/typescript.svg)](https://www.npmjs.com/package/typescript) |
| [webpack-cli](https://www.npmjs.com/package/webpack-cli) | [![NPM version](https://img.shields.io/badge/npm_package-3.2.3-9cf.svg)](https://www.npmjs.com/package/webpack-cli) | [![NPM version](https://badge.fury.io/js/webpack-cli.svg)](https://www.npmjs.com/package/webpack-cli) |

_See code: [src/schematics/rucken-app/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-app/index.ts)_

## Rucken app ionic
Mobile frontend generator application on Angular7+ with Ionic4, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-app-ionic custom-app-ionic --api=/api --author EndyKaufman --email admin@site15.ru
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the application. | {"$source":"argv","index":0} |
| org | {string} | The name of organization. | none |
| api | {string} | The backend api address (/api, http://host.com/api, https://api.host.com). | none |
| author | {string} | Author name. | none |
| email | {string} | Author email name. | none |

### Dependencies
| Name | Used | Current |
| ------ | ------ | ------ |
| [@angular/core](https://www.npmjs.com/package/@angular/core) | [![NPM version](https://img.shields.io/badge/npm_package-7.2.12-9cf.svg)](https://www.npmjs.com/package/@angular/core) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcore.svg)](https://www.npmjs.com/package/@angular/core) |
| [@capacitor/android](https://www.npmjs.com/package/@capacitor/android) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.0--beta.19-9cf.svg)](https://www.npmjs.com/package/@capacitor/android) | [![NPM version](https://badge.fury.io/js/%40capacitor%2Fandroid.svg)](https://www.npmjs.com/package/@capacitor/android) |
| [@capacitor/core](https://www.npmjs.com/package/@capacitor/core) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.0--beta.19-9cf.svg)](https://www.npmjs.com/package/@capacitor/core) | [![NPM version](https://badge.fury.io/js/%40capacitor%2Fcore.svg)](https://www.npmjs.com/package/@capacitor/core) |
| [@ionic-native/core](https://www.npmjs.com/package/@ionic-native/core) | [![NPM version](https://img.shields.io/badge/npm_package-5.4.0-9cf.svg)](https://www.npmjs.com/package/@ionic-native/core) | [![NPM version](https://badge.fury.io/js/%40ionic-native%2Fcore.svg)](https://www.npmjs.com/package/@ionic-native/core) |
| [@ionic-native/http](https://www.npmjs.com/package/@ionic-native/http) | [![NPM version](https://img.shields.io/badge/npm_package-5.4.0-9cf.svg)](https://www.npmjs.com/package/@ionic-native/http) | [![NPM version](https://badge.fury.io/js/%40ionic-native%2Fhttp.svg)](https://www.npmjs.com/package/@ionic-native/http) |
| [@ionic-native/splash-screen](https://www.npmjs.com/package/@ionic-native/splash-screen) | [![NPM version](https://img.shields.io/badge/npm_package-5.4.0-9cf.svg)](https://www.npmjs.com/package/@ionic-native/splash-screen) | [![NPM version](https://badge.fury.io/js/%40ionic-native%2Fsplash-screen.svg)](https://www.npmjs.com/package/@ionic-native/splash-screen) |
| [@ionic-native/status-bar](https://www.npmjs.com/package/@ionic-native/status-bar) | [![NPM version](https://img.shields.io/badge/npm_package-5.4.0-9cf.svg)](https://www.npmjs.com/package/@ionic-native/status-bar) | [![NPM version](https://badge.fury.io/js/%40ionic-native%2Fstatus-bar.svg)](https://www.npmjs.com/package/@ionic-native/status-bar) |
| [@ionic/angular](https://www.npmjs.com/package/@ionic/angular) | [![NPM version](https://img.shields.io/badge/npm_package-4.2.0-9cf.svg)](https://www.npmjs.com/package/@ionic/angular) | [![NPM version](https://badge.fury.io/js/%40ionic%2Fangular.svg)](https://www.npmjs.com/package/@ionic/angular) |
| [@ionic/storage](https://www.npmjs.com/package/@ionic/storage) | [![NPM version](https://img.shields.io/badge/npm_package-2.2.0-9cf.svg)](https://www.npmjs.com/package/@ionic/storage) | [![NPM version](https://badge.fury.io/js/%40ionic%2Fstorage.svg)](https://www.npmjs.com/package/@ionic/storage) |
| [@nguniversal/express-engine](https://www.npmjs.com/package/@nguniversal/express-engine) | [![NPM version](https://img.shields.io/badge/npm_package-7.1.1-9cf.svg)](https://www.npmjs.com/package/@nguniversal/express-engine) | [![NPM version](https://badge.fury.io/js/%40nguniversal%2Fexpress-engine.svg)](https://www.npmjs.com/package/@nguniversal/express-engine) |
| [@ngx-meta/core](https://www.npmjs.com/package/@ngx-meta/core) | [![NPM version](https://img.shields.io/badge/npm_package-7.0.0-9cf.svg)](https://www.npmjs.com/package/@ngx-meta/core) | [![NPM version](https://badge.fury.io/js/%40ngx-meta%2Fcore.svg)](https://www.npmjs.com/package/@ngx-meta/core) |
| [@rucken/core](https://www.npmjs.com/package/@rucken/core) | [![NPM version](https://img.shields.io/badge/npm_package-3.9.12-9cf.svg)](https://www.npmjs.com/package/@rucken/core) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fcore.svg)](https://www.npmjs.com/package/@rucken/core) |
| [@rucken/ionic](https://www.npmjs.com/package/@rucken/ionic) | [![NPM version](https://img.shields.io/badge/npm_package-0.3.7-9cf.svg)](https://www.npmjs.com/package/@rucken/ionic) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fionic.svg)](https://www.npmjs.com/package/@rucken/ionic) |
| [bind-observable](https://www.npmjs.com/package/bind-observable) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.2-9cf.svg)](https://www.npmjs.com/package/bind-observable) | [![NPM version](https://badge.fury.io/js/bind-observable.svg)](https://www.npmjs.com/package/bind-observable) |
| [cordova-android](https://www.npmjs.com/package/cordova-android) | [![NPM version](https://img.shields.io/badge/npm_package-8.0.0-9cf.svg)](https://www.npmjs.com/package/cordova-android) | [![NPM version](https://badge.fury.io/js/cordova-android.svg)](https://www.npmjs.com/package/cordova-android) |
| [cordova-plugin-advanced-http](https://www.npmjs.com/package/cordova-plugin-advanced-http) | [![NPM version](https://img.shields.io/badge/npm_package-2.0.7-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-advanced-http) | [![NPM version](https://badge.fury.io/js/cordova-plugin-advanced-http.svg)](https://www.npmjs.com/package/cordova-plugin-advanced-http) |
| [cordova-plugin-device](https://www.npmjs.com/package/cordova-plugin-device) | [![NPM version](https://img.shields.io/badge/npm_package-2.0.2-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-device) | [![NPM version](https://badge.fury.io/js/cordova-plugin-device.svg)](https://www.npmjs.com/package/cordova-plugin-device) |
| [cordova-plugin-file](https://www.npmjs.com/package/cordova-plugin-file) | [![NPM version](https://img.shields.io/badge/npm_package-6.0.1-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-file) | [![NPM version](https://badge.fury.io/js/cordova-plugin-file.svg)](https://www.npmjs.com/package/cordova-plugin-file) |
| [cordova-plugin-ionic-keyboard](https://www.npmjs.com/package/cordova-plugin-ionic-keyboard) | [![NPM version](https://img.shields.io/badge/npm_package-2.1.3-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-ionic-keyboard) | [![NPM version](https://badge.fury.io/js/cordova-plugin-ionic-keyboard.svg)](https://www.npmjs.com/package/cordova-plugin-ionic-keyboard) |
| [cordova-plugin-ionic-webview](https://www.npmjs.com/package/cordova-plugin-ionic-webview) | [![NPM version](https://img.shields.io/badge/npm_package-4.0.1-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-ionic-webview) | [![NPM version](https://badge.fury.io/js/cordova-plugin-ionic-webview.svg)](https://www.npmjs.com/package/cordova-plugin-ionic-webview) |
| [cordova-plugin-splashscreen](https://www.npmjs.com/package/cordova-plugin-splashscreen) | [![NPM version](https://img.shields.io/badge/npm_package-5.0.2-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-splashscreen) | [![NPM version](https://badge.fury.io/js/cordova-plugin-splashscreen.svg)](https://www.npmjs.com/package/cordova-plugin-splashscreen) |
| [cordova-plugin-statusbar](https://www.npmjs.com/package/cordova-plugin-statusbar) | [![NPM version](https://img.shields.io/badge/npm_package-2.4.2-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-statusbar) | [![NPM version](https://badge.fury.io/js/cordova-plugin-statusbar.svg)](https://www.npmjs.com/package/cordova-plugin-statusbar) |
| [cordova-plugin-whitelist](https://www.npmjs.com/package/cordova-plugin-whitelist) | [![NPM version](https://img.shields.io/badge/npm_package-1.3.3-9cf.svg)](https://www.npmjs.com/package/cordova-plugin-whitelist) | [![NPM version](https://badge.fury.io/js/cordova-plugin-whitelist.svg)](https://www.npmjs.com/package/cordova-plugin-whitelist) |
| [cordova-sqlite-storage](https://www.npmjs.com/package/cordova-sqlite-storage) | [![NPM version](https://img.shields.io/badge/npm_package-3.2.0-9cf.svg)](https://www.npmjs.com/package/cordova-sqlite-storage) | [![NPM version](https://badge.fury.io/js/cordova-sqlite-storage.svg)](https://www.npmjs.com/package/cordova-sqlite-storage) |
| [core-js](https://www.npmjs.com/package/core-js) | [![NPM version](https://img.shields.io/badge/npm_package-2.6.4-9cf.svg)](https://www.npmjs.com/package/core-js) | [![NPM version](https://badge.fury.io/js/core-js.svg)](https://www.npmjs.com/package/core-js) |
| [ngx-bind-io](https://www.npmjs.com/package/ngx-bind-io) | [![NPM version](https://img.shields.io/badge/npm_package-0.6.6-9cf.svg)](https://www.npmjs.com/package/ngx-bind-io) | [![NPM version](https://badge.fury.io/js/ngx-bind-io.svg)](https://www.npmjs.com/package/ngx-bind-io) |
| [ngx-cookie-service](https://www.npmjs.com/package/ngx-cookie-service) | [![NPM version](https://img.shields.io/badge/npm_package-2.1.0-9cf.svg)](https://www.npmjs.com/package/ngx-cookie-service) | [![NPM version](https://badge.fury.io/js/ngx-cookie-service.svg)](https://www.npmjs.com/package/ngx-cookie-service) |
| [ngx-dynamic-form-builder](https://www.npmjs.com/package/ngx-dynamic-form-builder) | [![NPM version](https://img.shields.io/badge/npm_package-0.9.0-9cf.svg)](https://www.npmjs.com/package/ngx-dynamic-form-builder) | [![NPM version](https://badge.fury.io/js/ngx-dynamic-form-builder.svg)](https://www.npmjs.com/package/ngx-dynamic-form-builder) |
| [ngx-remote-config](https://www.npmjs.com/package/ngx-remote-config) | [![NPM version](https://img.shields.io/badge/npm_package-0.0.5-9cf.svg)](https://www.npmjs.com/package/ngx-remote-config) | [![NPM version](https://badge.fury.io/js/ngx-remote-config.svg)](https://www.npmjs.com/package/ngx-remote-config) |
| [ngx-repository](https://www.npmjs.com/package/ngx-repository) | [![NPM version](https://img.shields.io/badge/npm_package-0.6.3-9cf.svg)](https://www.npmjs.com/package/ngx-repository) | [![NPM version](https://badge.fury.io/js/ngx-repository.svg)](https://www.npmjs.com/package/ngx-repository) |
| [rxjs](https://www.npmjs.com/package/rxjs) | [![NPM version](https://img.shields.io/badge/npm_package-6.4.0-9cf.svg)](https://www.npmjs.com/package/rxjs) | [![NPM version](https://badge.fury.io/js/rxjs.svg)](https://www.npmjs.com/package/rxjs) |

### Dev dependencies
| Name | Used | Current |
| ------ | ------ | ------ |
| [@angular-devkit/build-angular](https://www.npmjs.com/package/@angular-devkit/build-angular) | [![NPM version](https://img.shields.io/badge/npm_package-0.13.8-9cf.svg)](https://www.npmjs.com/package/@angular-devkit/build-angular) | [![NPM version](https://badge.fury.io/js/%40angular-devkit%2Fbuild-angular.svg)](https://www.npmjs.com/package/@angular-devkit/build-angular) |
| [@angular-devkit/core](https://www.npmjs.com/package/@angular-devkit/core) | [![NPM version](https://img.shields.io/badge/npm_package-7.3.8-9cf.svg)](https://www.npmjs.com/package/@angular-devkit/core) | [![NPM version](https://badge.fury.io/js/%40angular-devkit%2Fcore.svg)](https://www.npmjs.com/package/@angular-devkit/core) |
| [@angular/compiler](https://www.npmjs.com/package/@angular/compiler) | [![NPM version](https://img.shields.io/badge/npm_package-7.2.12-9cf.svg)](https://www.npmjs.com/package/@angular/compiler) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcompiler.svg)](https://www.npmjs.com/package/@angular/compiler) |
| [@capacitor/cli](https://www.npmjs.com/package/@capacitor/cli) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.0--beta.19-9cf.svg)](https://www.npmjs.com/package/@capacitor/cli) | [![NPM version](https://badge.fury.io/js/%40capacitor%2Fcli.svg)](https://www.npmjs.com/package/@capacitor/cli) |
| [@ionic/ng-toolkit](https://www.npmjs.com/package/@ionic/ng-toolkit) | [![NPM version](https://img.shields.io/badge/npm_package-1.1.0-9cf.svg)](https://www.npmjs.com/package/@ionic/ng-toolkit) | [![NPM version](https://badge.fury.io/js/%40ionic%2Fng-toolkit.svg)](https://www.npmjs.com/package/@ionic/ng-toolkit) |
| [@ionic/schematics-angular](https://www.npmjs.com/package/@ionic/schematics-angular) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.7-9cf.svg)](https://www.npmjs.com/package/@ionic/schematics-angular) | [![NPM version](https://badge.fury.io/js/%40ionic%2Fschematics-angular.svg)](https://www.npmjs.com/package/@ionic/schematics-angular) |
| [@nrwl/builders](https://www.npmjs.com/package/@nrwl/builders) | [![NPM version](https://img.shields.io/badge/npm_package-7.8.0-9cf.svg)](https://www.npmjs.com/package/@nrwl/builders) | [![NPM version](https://badge.fury.io/js/%40nrwl%2Fbuilders.svg)](https://www.npmjs.com/package/@nrwl/builders) |
| [@rucken/cli](https://www.npmjs.com/package/@rucken/cli) | [![NPM version](https://img.shields.io/badge/npm_package-3.3.3-9cf.svg)](https://www.npmjs.com/package/@rucken/cli) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fcli.svg)](https://www.npmjs.com/package/@rucken/cli) |
| [ng-packagr](https://www.npmjs.com/package/ng-packagr) | [![NPM version](https://img.shields.io/badge/npm_package-4.7.0-9cf.svg)](https://www.npmjs.com/package/ng-packagr) | [![NPM version](https://badge.fury.io/js/ng-packagr.svg)](https://www.npmjs.com/package/ng-packagr) |
| [ts-node](https://www.npmjs.com/package/ts-node) | [![NPM version](https://img.shields.io/badge/npm_package-8.0.2-9cf.svg)](https://www.npmjs.com/package/ts-node) | [![NPM version](https://badge.fury.io/js/ts-node.svg)](https://www.npmjs.com/package/ts-node) |
| [tslib](https://www.npmjs.com/package/tslib) | [![NPM version](https://img.shields.io/badge/npm_package-1.9.3-9cf.svg)](https://www.npmjs.com/package/tslib) | [![NPM version](https://badge.fury.io/js/tslib.svg)](https://www.npmjs.com/package/tslib) |
| [typescript](https://www.npmjs.com/package/typescript) | [![NPM version](https://img.shields.io/badge/npm_package-3.2.4-9cf.svg)](https://www.npmjs.com/package/typescript) | [![NPM version](https://badge.fury.io/js/typescript.svg)](https://www.npmjs.com/package/typescript) |

_See code: [src/schematics/rucken-app-ionic/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-app-ionic/index.ts)_

## Rucken app nestjs
REST generator backend applications on NestJS with TypeORM, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-app-nestjs custom-app-nestjs --author EndyKaufman --email admin@site15.ru
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the application. | {"$source":"argv","index":0} |
| org | {string} | The name of organization. | none |
| author | {string} | Author name. | none |
| email | {string} | Author email name. | none |

### Dependencies
| Name | Used | Current |
| ------ | ------ | ------ |
| [@angular/core](https://www.npmjs.com/package/@angular/core) | [![NPM version](https://img.shields.io/badge/npm_package-7.2.10-9cf.svg)](https://www.npmjs.com/package/@angular/core) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcore.svg)](https://www.npmjs.com/package/@angular/core) |
| [@angular-devkit/architect](https://www.npmjs.com/package/@angular-devkit/architect) | [![NPM version](https://img.shields.io/badge/npm_package-0.13.6-9cf.svg)](https://www.npmjs.com/package/@angular-devkit/architect) | [![NPM version](https://badge.fury.io/js/%40angular-devkit%2Farchitect.svg)](https://www.npmjs.com/package/@angular-devkit/architect) |
| [@angular-devkit/core](https://www.npmjs.com/package/@angular-devkit/core) | [![NPM version](https://img.shields.io/badge/npm_package-7.3.6-9cf.svg)](https://www.npmjs.com/package/@angular-devkit/core) | [![NPM version](https://badge.fury.io/js/%40angular-devkit%2Fcore.svg)](https://www.npmjs.com/package/@angular-devkit/core) |
| [@nestjs/common](https://www.npmjs.com/package/@nestjs/common) | [![NPM version](https://img.shields.io/badge/npm_package-5.7.4-9cf.svg)](https://www.npmjs.com/package/@nestjs/common) | [![NPM version](https://badge.fury.io/js/%40nestjs%2Fcommon.svg)](https://www.npmjs.com/package/@nestjs/common) |
| [@nestjs/core](https://www.npmjs.com/package/@nestjs/core) | [![NPM version](https://img.shields.io/badge/npm_package-5.7.4-9cf.svg)](https://www.npmjs.com/package/@nestjs/core) | [![NPM version](https://badge.fury.io/js/%40nestjs%2Fcore.svg)](https://www.npmjs.com/package/@nestjs/core) |
| [@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport) | [![NPM version](https://img.shields.io/badge/npm_package-5.1.0-9cf.svg)](https://www.npmjs.com/package/@nestjs/passport) | [![NPM version](https://badge.fury.io/js/%40nestjs%2Fpassport.svg)](https://www.npmjs.com/package/@nestjs/passport) |
| [@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger) | [![NPM version](https://img.shields.io/badge/npm_package-2.5.1-9cf.svg)](https://www.npmjs.com/package/@nestjs/swagger) | [![NPM version](https://badge.fury.io/js/%40nestjs%2Fswagger.svg)](https://www.npmjs.com/package/@nestjs/swagger) |
| [@nestjs/typeorm](https://www.npmjs.com/package/@nestjs/typeorm) | [![NPM version](https://img.shields.io/badge/npm_package-5.3.0-9cf.svg)](https://www.npmjs.com/package/@nestjs/typeorm) | [![NPM version](https://badge.fury.io/js/%40nestjs%2Ftypeorm.svg)](https://www.npmjs.com/package/@nestjs/typeorm) |
| [@nrwl/nx](https://www.npmjs.com/package/@nrwl/nx) | [![NPM version](https://img.shields.io/badge/npm_package-7.7.2-9cf.svg)](https://www.npmjs.com/package/@nrwl/nx) | [![NPM version](https://badge.fury.io/js/%40nrwl%2Fnx.svg)](https://www.npmjs.com/package/@nrwl/nx) |
| [@rucken/auth-nestjs](https://www.npmjs.com/package/@rucken/auth-nestjs) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.10-9cf.svg)](https://www.npmjs.com/package/@rucken/auth-nestjs) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fauth-nestjs.svg)](https://www.npmjs.com/package/@rucken/auth-nestjs) |
| [@rucken/core-nestjs](https://www.npmjs.com/package/@rucken/core-nestjs) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.10-9cf.svg)](https://www.npmjs.com/package/@rucken/core-nestjs) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fcore-nestjs.svg)](https://www.npmjs.com/package/@rucken/core-nestjs) |
| [@types/passport-facebook-token](https://www.npmjs.com/package/@types/passport-facebook-token) | [![NPM version](https://img.shields.io/badge/npm_package-0.4.33-9cf.svg)](https://www.npmjs.com/package/@types/passport-facebook-token) | [![NPM version](https://badge.fury.io/js/%40types%2Fpassport-facebook-token.svg)](https://www.npmjs.com/package/@types/passport-facebook-token) |
| [@types/passport-local](https://www.npmjs.com/package/@types/passport-local) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.33-9cf.svg)](https://www.npmjs.com/package/@types/passport-local) | [![NPM version](https://badge.fury.io/js/%40types%2Fpassport-local.svg)](https://www.npmjs.com/package/@types/passport-local) |
| [class-transformer](https://www.npmjs.com/package/class-transformer) | [![NPM version](https://img.shields.io/badge/npm_package-0.2.0-9cf.svg)](https://www.npmjs.com/package/class-transformer) | [![NPM version](https://badge.fury.io/js/class-transformer.svg)](https://www.npmjs.com/package/class-transformer) |
| [class-validator](https://www.npmjs.com/package/class-validator) | [![NPM version](https://img.shields.io/badge/npm_package-0.9.1-9cf.svg)](https://www.npmjs.com/package/class-validator) | [![NPM version](https://badge.fury.io/js/class-validator.svg)](https://www.npmjs.com/package/class-validator) |
| [connection-string](https://www.npmjs.com/package/connection-string) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.1-9cf.svg)](https://www.npmjs.com/package/connection-string) | [![NPM version](https://badge.fury.io/js/connection-string.svg)](https://www.npmjs.com/package/connection-string) |
| [fastify-formbody](https://www.npmjs.com/package/fastify-formbody) | [![NPM version](https://img.shields.io/badge/npm_package-2.1.0-9cf.svg)](https://www.npmjs.com/package/fastify-formbody) | [![NPM version](https://badge.fury.io/js/fastify-formbody.svg)](https://www.npmjs.com/package/fastify-formbody) |
| [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken) | [![NPM version](https://img.shields.io/badge/npm_package-8.5.0-9cf.svg)](https://www.npmjs.com/package/jsonwebtoken) | [![NPM version](https://badge.fury.io/js/jsonwebtoken.svg)](https://www.npmjs.com/package/jsonwebtoken) |
| [node-django-hashers](https://www.npmjs.com/package/node-django-hashers) | [![NPM version](https://img.shields.io/badge/npm_package-1.1.6-9cf.svg)](https://www.npmjs.com/package/node-django-hashers) | [![NPM version](https://badge.fury.io/js/node-django-hashers.svg)](https://www.npmjs.com/package/node-django-hashers) |
| [passport](https://www.npmjs.com/package/passport) | [![NPM version](https://img.shields.io/badge/npm_package-0.4.0-9cf.svg)](https://www.npmjs.com/package/passport) | [![NPM version](https://badge.fury.io/js/passport.svg)](https://www.npmjs.com/package/passport) |
| [passport-facebook-token](https://www.npmjs.com/package/passport-facebook-token) | [![NPM version](https://img.shields.io/badge/npm_package-3.3.0-9cf.svg)](https://www.npmjs.com/package/passport-facebook-token) | [![NPM version](https://badge.fury.io/js/passport-facebook-token.svg)](https://www.npmjs.com/package/passport-facebook-token) |
| [passport-google-plus-token](https://www.npmjs.com/package/passport-google-plus-token) | [![NPM version](https://img.shields.io/badge/npm_package-2.1.0-9cf.svg)](https://www.npmjs.com/package/passport-google-plus-token) | [![NPM version](https://badge.fury.io/js/passport-google-plus-token.svg)](https://www.npmjs.com/package/passport-google-plus-token) |
| [passport-http-bearer](https://www.npmjs.com/package/passport-http-bearer) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.1-9cf.svg)](https://www.npmjs.com/package/passport-http-bearer) | [![NPM version](https://badge.fury.io/js/passport-http-bearer.svg)](https://www.npmjs.com/package/passport-http-bearer) |
| [passport-jwt](https://www.npmjs.com/package/passport-jwt) | [![NPM version](https://img.shields.io/badge/npm_package-4.0.0-9cf.svg)](https://www.npmjs.com/package/passport-jwt) | [![NPM version](https://badge.fury.io/js/passport-jwt.svg)](https://www.npmjs.com/package/passport-jwt) |
| [passport-local](https://www.npmjs.com/package/passport-local) | [![NPM version](https://img.shields.io/badge/npm_package-1.0.0-9cf.svg)](https://www.npmjs.com/package/passport-local) | [![NPM version](https://badge.fury.io/js/passport-local.svg)](https://www.npmjs.com/package/passport-local) |
| [pg](https://www.npmjs.com/package/pg) | [![NPM version](https://img.shields.io/badge/npm_package-7.8.1-9cf.svg)](https://www.npmjs.com/package/pg) | [![NPM version](https://badge.fury.io/js/pg.svg)](https://www.npmjs.com/package/pg) |
| [rxjs](https://www.npmjs.com/package/rxjs) | [![NPM version](https://img.shields.io/badge/npm_package-6.4.0-9cf.svg)](https://www.npmjs.com/package/rxjs) | [![NPM version](https://badge.fury.io/js/rxjs.svg)](https://www.npmjs.com/package/rxjs) |
| [sqlite3](https://www.npmjs.com/package/sqlite3) | [![NPM version](https://img.shields.io/badge/npm_package-4.0.6-9cf.svg)](https://www.npmjs.com/package/sqlite3) | [![NPM version](https://badge.fury.io/js/sqlite3.svg)](https://www.npmjs.com/package/sqlite3) |
| [ts-node](https://www.npmjs.com/package/ts-node) | [![NPM version](https://img.shields.io/badge/npm_package-7.0.1-9cf.svg)](https://www.npmjs.com/package/ts-node) | [![NPM version](https://badge.fury.io/js/ts-node.svg)](https://www.npmjs.com/package/ts-node) |
| [tsconfig-paths](https://www.npmjs.com/package/tsconfig-paths) | [![NPM version](https://img.shields.io/badge/npm_package-3.7.0-9cf.svg)](https://www.npmjs.com/package/tsconfig-paths) | [![NPM version](https://badge.fury.io/js/tsconfig-paths.svg)](https://www.npmjs.com/package/tsconfig-paths) |
| [typeorm](https://www.npmjs.com/package/typeorm) | [![NPM version](https://img.shields.io/badge/npm_package-0.2.14-9cf.svg)](https://www.npmjs.com/package/typeorm) | [![NPM version](https://badge.fury.io/js/typeorm.svg)](https://www.npmjs.com/package/typeorm) |
| [typescript](https://www.npmjs.com/package/typescript) | [![NPM version](https://img.shields.io/badge/npm_package-3.2.2-9cf.svg)](https://www.npmjs.com/package/typescript) | [![NPM version](https://badge.fury.io/js/typescript.svg)](https://www.npmjs.com/package/typescript) |
| [cross-env](https://www.npmjs.com/package/cross-env) | [![NPM version](https://img.shields.io/badge/npm_package-5.2.0-9cf.svg)](https://www.npmjs.com/package/cross-env) | [![NPM version](https://badge.fury.io/js/cross-env.svg)](https://www.npmjs.com/package/cross-env) |

### Dev dependencies
| Name | Used | Current |
| ------ | ------ | ------ |
| [@angular-devkit/build-angular](https://www.npmjs.com/package/@angular-devkit/build-angular) | [![NPM version](https://img.shields.io/badge/npm_package-0.13.6-9cf.svg)](https://www.npmjs.com/package/@angular-devkit/build-angular) | [![NPM version](https://badge.fury.io/js/%40angular-devkit%2Fbuild-angular.svg)](https://www.npmjs.com/package/@angular-devkit/build-angular) |
| [@angular/cli](https://www.npmjs.com/package/@angular/cli) | [![NPM version](https://img.shields.io/badge/npm_package-7.3.6-9cf.svg)](https://www.npmjs.com/package/@angular/cli) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcli.svg)](https://www.npmjs.com/package/@angular/cli) |
| [@angular/compiler](https://www.npmjs.com/package/@angular/compiler) | [![NPM version](https://img.shields.io/badge/npm_package-7.2.10-9cf.svg)](https://www.npmjs.com/package/@angular/compiler) | [![NPM version](https://badge.fury.io/js/%40angular%2Fcompiler.svg)](https://www.npmjs.com/package/@angular/compiler) |
| [@nestjs/schematics](https://www.npmjs.com/package/@nestjs/schematics) | [![NPM version](https://img.shields.io/badge/npm_package-5.11.2-9cf.svg)](https://www.npmjs.com/package/@nestjs/schematics) | [![NPM version](https://badge.fury.io/js/%40nestjs%2Fschematics.svg)](https://www.npmjs.com/package/@nestjs/schematics) |
| [@nestjs/testing](https://www.npmjs.com/package/@nestjs/testing) | [![NPM version](https://img.shields.io/badge/npm_package-5.7.4-9cf.svg)](https://www.npmjs.com/package/@nestjs/testing) | [![NPM version](https://badge.fury.io/js/%40nestjs%2Ftesting.svg)](https://www.npmjs.com/package/@nestjs/testing) |
| [@nrwl/builders](https://www.npmjs.com/package/@nrwl/builders) | [![NPM version](https://img.shields.io/badge/npm_package-7.7.2-9cf.svg)](https://www.npmjs.com/package/@nrwl/builders) | [![NPM version](https://badge.fury.io/js/%40nrwl%2Fbuilders.svg)](https://www.npmjs.com/package/@nrwl/builders) |
| [@nrwl/schematics](https://www.npmjs.com/package/@nrwl/schematics) | [![NPM version](https://img.shields.io/badge/npm_package-7.7.2-9cf.svg)](https://www.npmjs.com/package/@nrwl/schematics) | [![NPM version](https://badge.fury.io/js/%40nrwl%2Fschematics.svg)](https://www.npmjs.com/package/@nrwl/schematics) |
| [@rucken/cli](https://www.npmjs.com/package/@rucken/cli) | [![NPM version](https://img.shields.io/badge/npm_package-3.3.3-9cf.svg)](https://www.npmjs.com/package/@rucken/cli) | [![NPM version](https://badge.fury.io/js/%40rucken%2Fcli.svg)](https://www.npmjs.com/package/@rucken/cli) |
| [nodemon](https://www.npmjs.com/package/nodemon) | [![NPM version](https://img.shields.io/badge/npm_package-1.18.10-9cf.svg)](https://www.npmjs.com/package/nodemon) | [![NPM version](https://badge.fury.io/js/nodemon.svg)](https://www.npmjs.com/package/nodemon) |
| [pm2](https://www.npmjs.com/package/pm2) | [![NPM version](https://img.shields.io/badge/npm_package-3.3.1-9cf.svg)](https://www.npmjs.com/package/pm2) | [![NPM version](https://badge.fury.io/js/pm2.svg)](https://www.npmjs.com/package/pm2) |
| [webpack](https://www.npmjs.com/package/webpack) | [![NPM version](https://img.shields.io/badge/npm_package-4.28.4-9cf.svg)](https://www.npmjs.com/package/webpack) | [![NPM version](https://badge.fury.io/js/webpack.svg)](https://www.npmjs.com/package/webpack) |
| [webpack-cli](https://www.npmjs.com/package/webpack-cli) | [![NPM version](https://img.shields.io/badge/npm_package-3.2.1-9cf.svg)](https://www.npmjs.com/package/webpack-cli) | [![NPM version](https://badge.fury.io/js/webpack-cli.svg)](https://www.npmjs.com/package/webpack-cli) |
| [webpack-node-externals](https://www.npmjs.com/package/webpack-node-externals) | [![NPM version](https://img.shields.io/badge/npm_package-1.7.2-9cf.svg)](https://www.npmjs.com/package/webpack-node-externals) | [![NPM version](https://badge.fury.io/js/webpack-node-externals.svg)](https://www.npmjs.com/package/webpack-node-externals) |

_See code: [src/schematics/rucken-app-nestjs/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-app-nestjs/index.ts)_

## Rucken entity
Model generator and frontend application, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-entity custom-entity --org custom-org --lib custom-lib
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the entity. | {"$source":"argv","index":0} |
| lib | {string} | The name of the library. | none |
| org | {string} | The name of organization. | none |

_See code: [src/schematics/rucken-entity/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-entity/index.ts)_

## Rucken entity ionic
The generator of the main components for editing data on the model and for a mobile frontend application on Angular7+ with Ionic4, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-entity-ionic custom-entity --org custom-org --lib custom-lib-ionic --entitiesLib custom-lib
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the entity. | {"$source":"argv","index":0} |
| lib | {string} | The name of the library. | none |
| entitiesLib | {string} | The name of the library with entities. | none |
| org | {string} | The name of organization. | none |

_See code: [src/schematics/rucken-entity-ionic/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-entity-ionic/index.ts)_

## Rucken entity ionic to app
Binding components for editing an entity to a mobile frontend application on Angular7+ with Ionic4, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-entity-ionic-to-app custom-entity --lib custom-lib-ionic --org custom-org --app custom-app-ionic --entitiesLib custom-lib
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the entity. | {"$source":"argv","index":0} |
| lib | {string} | The name of the library. | none |
| entitiesLib | {string} | The name of the library with entities. | none |
| org | {string} | The name of organization. | none |
| app | {string} | The name of application. | none |

_See code: [src/schematics/rucken-entity-ionic-to-app/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-entity-ionic-to-app/index.ts)_

## Rucken entity nestjs
The generator of the entity, the DTO, the service and the controller, for editing the entity data for the backend of the application on NestJS with TypeORM, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-entity-nestjs custom-entity --org custom-org --lib custom-lib-nestjs --timestamp 1553957529598
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the entity. | {"$source":"argv","index":0} |
| lib | {string} | The name of the library. | none |
| org | {string} | The name of organization. | none |
| timestamp | {number} | Timestamp used in migrations | none |

_See code: [src/schematics/rucken-entity-nestjs/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-entity-nestjs/index.ts)_

## Rucken entity web
The generator of the main components for editing data on the model and for the frontend application on Angular7+ with Bootstrap3, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-entity-web custom-entity --org custom-org --lib custom-lib-web --entitiesLib custom-lib
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the entity. | {"$source":"argv","index":0} |
| lib | {string} | The name of the library. | none |
| entitiesLib | {string} | The name of the library with entities. | none |
| org | {string} | The name of organization. | none |

_See code: [src/schematics/rucken-entity-web/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-entity-web/index.ts)_

## Rucken entity web to app
Binding of components for editing an entity to a frontend application on Angular7+ with Bootstrap3, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-entity-web-to-app custom-entity --lib custom-lib-web --org custom-org --app custom-app --entitiesLib custom-lib
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the entity. | {"$source":"argv","index":0} |
| lib | {string} | The name of the library. | none |
| entitiesLib | {string} | The name of the library with entities. | none |
| org | {string} | The name of organization. | none |
| app | {string} | The name of application. | none |

_See code: [src/schematics/rucken-entity-web-to-app/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-entity-web-to-app/index.ts)_

## Rucken lib
Frontend library generator, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-lib custom-lib-web --org custom-org --author EndyKaufman --email admin@site15.ru
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the library. | {"$source":"argv","index":0} |
| org | {string} | The name of organization. | none |
| author | {string} | Author name. | none |
| email | {string} | Author email name. | none |

_See code: [src/schematics/rucken-lib/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-lib/index.ts)_

## Rucken lib nestjs
Backend library generator on NestJS, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-lib-nestjs custom-lib-nestjs --org custom-org --author EndyKaufman --email admin@site15.ru
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the library. | {"$source":"argv","index":0} |
| org | {string} | The name of organization. | none |
| author | {string} | Author name. | none |
| email | {string} | Author email name. | none |

_See code: [src/schematics/rucken-lib-nestjs/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-lib-nestjs/index.ts)_

## Rucken lib nestjs to app
Linking the library to the backend application on NestJS, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:rucken-lib-nestjs-to-app custom-lib-nestjs --org custom-org --app custom-app-nestjs
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the library. | {"$source":"argv","index":0} |
| org | {string} | The name of organization. | none |
| app | {string} | The name of application. | none |

_See code: [src/schematics/rucken-lib-nestjs-to-app/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-lib-nestjs-to-app/index.ts)_

## Rucken lib to app
Linking the library to the frontend application on Angular7+, based on the Rucken template

Examples:
```bash
schematics @rucken/schematics:rucken-lib-to-app custom-lib --org custom-org --app custom-app
schematics @rucken/schematics:rucken-lib-to-app custom-lib-web --org custom-org --app custom-app
schematics @rucken/schematics:rucken-lib-to-app custom-lib --org custom-org --app custom-app-ionic
schematics @rucken/schematics:rucken-lib-to-app custom-lib-ionic --org custom-org --app custom-app-ionic
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the library. | {"$source":"argv","index":0} |
| org | {string} | The name of organization. | none |
| app | {string} | The name of application. | none |

_See code: [src/schematics/rucken-lib-to-app/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/rucken-lib-to-app/index.ts)_

## Workspace
Workspace generator, based on the Rucken template

Example:
```bash
schematics @rucken/schematics:workspace custom-workspace --author EndyKaufman --email admin@site15.ru
```

### Parameters
| Name | Type | Description | Default |
|------|:----:|------------:|--------:|
| name | {string} | The name of the workspace. | {"$source":"argv","index":0} |
| author | {string} | Author name. | none |
| email | {string} | Author email name. | none |

_See code: [src/schematics/workspace/index.ts](https://github.com/rucken/schematics/blob/master/src/schematics/workspace/index.ts)_

<!-- generatorsstop -->

## License

MIT

[travis-image]: https://travis-ci.org/rucken/schematics.svg?branch=master
[travis-url]: https://travis-ci.org/rucken/schematics
[gitter-image]: https://img.shields.io/gitter/room/rucken/schematics.js.svg
[gitter-url]: https://gitter.im/rucken/schematics
[npm-image]: https://badge.fury.io/js/%40rucken%2Fschematics.svg
[npm-url]: https://npmjs.org/package/@rucken/schematics
[dependencies-image]: https://david-dm.org/rucken/schematics/status.svg
[dependencies-url]: https://david-dm.org/rucken/schematics
[telegram-image]: https://img.shields.io/badge/chat-telegram-blue.svg?maxAge=2592000
[telegram-url]: https://t.me/rucken
