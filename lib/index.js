const fs = require('fs')
const {
  authenticate,
  getAllRepos,
  fetchDependentPackages,
} = require('./github')

module.exports.dependentPackages = async (clientPackagePath, searchAll, token) => {
  if (!fs.existsSync(clientPackagePath)) return Promise.reject(new Error(`File ${clientPackagePath} does not exist`))
  authenticate(token)

  const clientPackage = JSON.parse(fs.readFileSync(clientPackagePath))
  const { dependents, repository } = clientPackage

  let org
  if (typeof repository === 'object' && repository.url) org = repository.url.match(/github.com\/(.*?)\//)
  else org = (repository || '').split('/')[0]

  if (!dependents) return Promise.reject(new Error(`No dependents defined in ${clientPackagePath}`))
  if (!org) return Promise.reject(new Error(`Cannot determine repository organization from \`repository\` key in ${clientPackagePath}`))

  const repos = searchAll ? (await getAllRepos()).map(repo => repo.name) : dependents
  const dependentPackages = await fetchDependentPackages(org, repos)

  return {
    clientPackage,
    dependentPackages,
  }
}
