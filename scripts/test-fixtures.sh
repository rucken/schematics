#!/bin/bash
rm -rf ./fixtures

npm run schematics -- .:workspace fixtures --author EndyKaufman --email admin@site15.ru
cd fixtures
npm run affected:prepare
npm i
cd ..

npm run schematics -- .:rucken-app custom-app --api=/api --author EndyKaufman --email admin@site15.ru --workspace fixtures
cd fixtures
npm i
npm run affected:prepare
npm run ng build custom-app
cd ..

npm run schematics -- .:rucken-app-ionic custom-app-ionic --api=/api --author EndyKaufman --email admin@site15.ru --workspace fixtures
cd fixtures
npm i
npm run affected:prepare
npm run ng build custom-app-ionic
npm run ng run custom-app-ionic:android-prepare
# twice run as workaround for long operations
npm run ng run custom-app-ionic:android-prepare
npm run ng run custom-app-ionic:android-build
cd ..

npm run schematics -- .:rucken-app-nestjs custom-app-nestjs --author EndyKaufman --email admin@site15.ru --workspace fixtures
cd fixtures
npm i
npm run affected:prepare
npm run ng build custom-app-nestjs
cd ..

npm run schematics -- .:rucken-lib custom-lib --org custom-org --author EndyKaufman --email admin@site15.ru --workspace fixtures
cd fixtures
npm run affected:prepare
npm run ng build custom-lib
cd ..

npm run schematics -- .:rucken-lib custom-lib-web --org custom-org --author EndyKaufman --email admin@site15.ru --workspace fixtures
cd fixtures
npm run affected:prepare
npm run ng build custom-lib-web
cd ..

npm run schematics -- .:rucken-lib custom-lib-ionic --org custom-org --author EndyKaufman --email admin@site15.ru --workspace fixtures
cd fixtures
npm run affected:prepare
npm run ng build custom-lib-ionic
cd ..

npm run schematics -- .:rucken-lib-nestjs custom-lib-nestjs --org custom-org --author EndyKaufman --email admin@site15.ru --workspace fixtures
cd fixtures
npm run affected:prepare
npm run ng build custom-lib-nestjs
cd ..

npm run schematics -- .:rucken-entity custom-entity --org custom-org --lib custom-lib --workspace fixtures
npm run schematics -- .:rucken-lib-to-app custom-lib --org custom-org --app custom-app --workspace fixtures
npm run schematics -- .:rucken-entity-web custom-entity --org custom-org --lib custom-lib-web --entitiesLib custom-lib --workspace fixtures
npm run schematics -- .:rucken-lib-to-app custom-lib-web --org custom-org --app custom-app --workspace fixtures
cd fixtures
npm run affected:prepare
npm run ng build custom-app
cd ..

npm run schematics -- .:rucken-entity-web-to-app custom-entity --lib custom-lib-web --org custom-org --app custom-app --entitiesLib custom-lib --workspace fixtures
npm run schematics -- .:rucken-entity-ionic custom-entity --org custom-org --lib custom-lib-ionic --entitiesLib custom-lib --workspace fixtures
npm run schematics -- .:rucken-lib-to-app custom-lib --org custom-org --app custom-app-ionic --workspace fixtures
npm run schematics -- .:rucken-lib-to-app custom-lib-ionic --org custom-org --app custom-app-ionic --workspace fixtures
npm run schematics -- .:rucken-entity-ionic-to-app custom-entity --lib custom-lib-ionic --org custom-org --app custom-app-ionic --entitiesLib custom-lib --workspace fixtures
cd fixtures
npm run affected:prepare
npm run ng build custom-app-ionic
npm run ng run custom-app-ionic:android-prepare
# twice run as workaround for long operations
npm run ng run custom-app-ionic:android-prepare
npm run ng run custom-app-ionic:android-build
cd ..

npm run schematics -- .:rucken-entity-nestjs custom-entity --org custom-org --lib custom-lib-nestjs --timestamp 1553957529598 --workspace fixtures
npm run schematics -- .:rucken-lib-nestjs-to-app custom-lib-nestjs --org custom-org --app custom-app-nestjs --workspace fixtures
cd fixtures
npm run affected:prepare
npm run ng build custom-app-nestjs
cd ..