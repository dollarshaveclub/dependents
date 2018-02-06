# dependents
Shows package dependency versions in specified node repositories.

## Installation & Usage
```sh
# Install via NPM
npm i -g @dollarshaveclub/dependents
```
Then add a `dependents` key in your projects package.json that contains a list of repositories with their own `package.json` file. Note that these repos will be using the same organization defined in your `repository` key.
```javascript
// package.json
{
  "name": "my-package",
  "version": "5.2.0",
  "repository": "dollarshaveclub/my-package",

  "dependents": [
    "some-repo",
    "another-repo",
    "third-repo"
  ]
}

```

Dependents will read the package files specified and attempt to resolve your packages version number from them. This is useful when publishing a package across many applications that are not necessarily published to NPM.

```
dependents -h
  Options:
    -V, --version         output the version number
    -p, --package [file]  The path to the package.json file that contains dependents
    -r, --remote          Search against remote repositories in your org
    -i, --installed       Only show packages that have the dependency installed
    -h, --help            output usage information
```

## Examples
```sh
$ dependents -p some/path/to/package.json # Shows a list of dependent versions in the specified package
$ dependents -r # Lists all repos in the org and if they depend on the client package
$ dependents -ri # Lists all dependents in the org that actually have the client package installed
```

<img src="https://i.imgur.com/dZNtl5b.jpg">
