const latestSemver: (versions: string[]) => string | undefined = require('latest-semver');

export function vlatest(versions: string[]) {
    return latestSemver(
        versions.filter(version => version).map(
            version => version.split('=').join('')
                .split('<').join('')
                .split('>').join('')
                .split('~').join('')
                .split('^').join('')
        )
    );
}