const { exec } = require('child_process')
const readlineSync = require('readline-sync')
const colors = require('colors/safe')

const [_version, _file, ...filePaths] = process.argv

const uploadSettings = filePaths.reduce((uploadSettings, filePath) => {
  const dir = `${filePath
    .split('/')
    .slice(0, -1)
    .join('/') + '/'}`
  uploadSettings.get(dir) || uploadSettings.set(dir, [])
  uploadSettings.get(dir).push(`"${filePath}"`)
  return uploadSettings
}, new Map())

uploadSettings.forEach((files, dir) => {
  upload({ dir, files })
})

function upload({ dir, files }) {
  exec([setBasicCommand({ dir, files }), `--dryrun`].join(' '), confirm({ dir, files }))
}
function setBasicCommand({ dir, files }) {
  return [
    `aws s3 cp`,
    `dist`,
    `s3://yoshida-dev-env`,
    `--profile yoshidadevenv`,
    `--exclude "*"`,
    ...files.map(file => `--include ${file}`),
    `--recursive`,
  ].join(' ')
}

function confirm({ dir, files }) {
  return (err, stdout, stderr) => {
    if (err) return console.log('stderr: ', stderr)
    console.log(colors.yellow(stdout) + '↑ アップロード内容を確認してください。')
    if (readlineSync.keyInYN('本当に実行しますか？')) {
      exec(setBasicCommand({ dir, files }), complete)
    } else {
      cancel(stdout)
    }
  }
}

function complete(err, stdout, stderr) {
  if (err) return console.log('stderr: ', stderr)
  console.log(colors.green(stdout) + 'アップロード完了しました。')
}

function cancel(stdout) {
  console.log(colors.gray(stdout) + '↑ キャンセルしました。')
}
