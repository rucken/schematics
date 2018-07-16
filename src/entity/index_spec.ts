import { Tree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';
import { readFileSync } from 'fs';
import { join } from 'path';
import { basename } from '../../node_modules/@angular-devkit/core';


// SchematicTestRunner needs an absolute path to the collection to test.
const collectionPath = join(__dirname, '../collection.json');
const rootPath = join(__dirname, '../..');


describe('entity', () => {
  it('requires required option', () => {
    // We test that

    const runner = new SchematicTestRunner('schematics', collectionPath);
    const tree = runner.runSchematic('entity', {
      name: 'test-entity',
      root: "fixtures/entity"
    }, Tree.empty());
    tree.getDir('')
      .visit(filePath => {
        if (basename(filePath) !== 'index.ts' && basename(filePath) !== 'package.json') {
          const content = tree.readContent(filePath);
          const existsContent = readFileSync(
            join(rootPath, filePath)
          ).toString();
          expect(content).toEqual(existsContent);
        }
      });
  });
});
