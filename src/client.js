import { createReadStream } from 'fs'
import { relative } from 'path'
import { create } from 'watchr'
import request from 'request'
import promisify from 'es6-promisify'

const requestAsync = promisify(request)

const host = 'http://localhost:8532'

const watcher = create(process.cwd())

watcher.on('change', onFileChange)
watcher.setConfig({
  interval: 500,
  catchupDelay: 500
})
watcher.watch(() => console.log('watching...'))


function onFileChange (changeType, filePath, currStat, prevStat) {
  // TODO: handle folder changes...
  if (typeof currStat !== 'undefined' && currStat !== null && 'isFile' in currStat && !currStat.isFile()) return
  if (typeof prevStat !== 'undefined' && prevStat !== null && 'isFile' in prevStat && !prevStat.isFile()) return

  switch(changeType) {
    case 'create':
    case 'update':
      return postFile(filePath)
    case 'delete':
      return deleteFile(filePath)
  }
}

async function postFile(filePath) {
  const relativePath = convertFullPathToRelative(filePath)
  console.log(`"${relativePath}" created or changed`)

  createReadStream(relativePath).pipe(request.post(getUrl(relativePath)))
}

async function deleteFile(filePath) {
  const relativePath = convertFullPathToRelative(filePath)
  console.log(`"${relativePath}" deleted`)

  request.delete(getUrl(relativePath))
}

function convertFullPathToRelative (fullPath) {
  return relative(process.cwd(), fullPath)
}

function getUrl (fileName) {
  return `${host}/file/${fileName}`
}
