const fs = require('fs')
const path = require('path')
const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']

function getImagePaths(folder, callback) {
  fs.readdir(folder, (err, files) => {
    if (err) {
      return callback(err)
    }

    let imagePaths = []
    let pending = files.length
    if (!pending) {
      return callback(null, imagePaths)
    }

    files.forEach((file) => {
      const filePath = path.resolve(folder, file)
      fs.stat(filePath, (err, stats) => {
        if (err) {
          return callback(err)
        }

        if (stats.isDirectory()) {
          // 递归子目录
          getImagePaths(filePath, (err, imgs) => {
            if (err) {
              return callback(err)
            }
            imagePaths = imagePaths.concat(imgs)
            if (!--pending) {
              callback(null, imagePaths)
            }
          })
        } else if (stats.isFile() && imageExts.includes(path.extname(file).slice(1))) {
          imagePaths.push(filePath)
          if (!--pending) {
            callback(null, imagePaths)
          }
        } else {
          if (!--pending) {
            callback(null, imagePaths)
          }
        }
      })
    })
  })
}

// 使用方法
getImagePaths('D:code\\智慧车站厦门地铁\\svn_new\\front', (err, imagePaths) => {
  if (err) {
    console.error('Error:', err)
    return
  }
  console.log('Image paths:', imagePaths)
})
