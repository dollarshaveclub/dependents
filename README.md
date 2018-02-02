# dependents
Shows package dependency versions in specified node repositories.

## Installation & Usage
```sh
# Install via NPM
npm i -g @dollarshaveclub/dependents

# Visit your node repo and create a dependents file that lists dependent repositories
echo "github-org/repo-name" >> .dependents

dependents # Reads your .dependents file and resolves package versions
```

<img src="https://i.imgur.com/dZNtl5b.jpg">
