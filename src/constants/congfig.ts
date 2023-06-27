import minimist from 'minimist'

const argv = minimist(process.argv.slice(2))

export const isProduction = Boolean(argv.production)
