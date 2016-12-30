import { resolve, dirname } from 'path'
import { createWriteStream } from 'fs'
import express from 'express'
import promisify from 'es6-promisify'
import mkdirp from 'mkdirp'
import rimraf from 'rimraf'

const mkdirpAsync = promisify(mkdirp)
const rimrafAsync = promisify(rimraf)

const server = express()

server.post(/\/file\/(.+)/, async function(req, res, next) {
  // TODO: Authenticate here...
  const localPath = getLocalPath(req)

  console.log(`Writing to file at "${localPath}"`)

  // First ensure the directory exists...
  await mkdirpAsync(dirname(localPath))

  // Then pipe the read stream to the file
  req.pipe(createWriteStream(localPath))

  // and when it's done, send the success: true message
  req.on('end', () => {
    res.json({ success: true }).end()
    next()
  })
})

server.delete(/\/file\/(.+)/, async function(req, res, next) {
  // TODO: Authenticate here...
  const localPath = getLocalPath(req)

  console.log(`Deleting file at "${localPath}"`)

  await rimrafAsync(localPath, { disableGlob: true })

  res.json({ success: true }).end()
  next()
})

server.listen(8532)


function getLocalPath (req) {
  return resolve(process.cwd(), req.params[0])
}
