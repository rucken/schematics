import { strings } from '@angular-devkit/core';
import { apply, chain, MergeStrategy, mergeWith, move, Rule, template, url } from '@angular-devkit/schematics';
import { humanize, pluralize, underscore } from 'inflection';

const dot = require('dot-object');
const gitEmail = require('git-user-email');
const gitUsername = require('git-username');

// Instead of `any`, it would make sense here to get a schema-to-dts package and output the
// interfaces so you get type-safe options.
export default function (options: any): Rule {
  const root = options.root;
  const name = options.name;
  const gitInfo = { username: gitUsername(), email: gitEmail() };
  const templateSource = apply(url('./files'), [
    template({
      ...strings,
      humanize: (str: string, low_first_letter?: boolean) =>
        humanize(
          underscore(str).replace(new RegExp('-', 'g'), ' '),
          low_first_letter
        ),
      pluralize: pluralize,
      name: name,
      root: root,
      gitInfo: gitInfo,
      ...dot.dot({ gitInfo: gitInfo }),
      ts: 'ts',
      json: 'json',
      env: 'env'
    }),
    move('.'),
  ]);
  // The chain rule allows us to chain multiple rules and apply them one after the other.
  return chain([
    mergeWith(templateSource, MergeStrategy.Overwrite)
  ]);
}
