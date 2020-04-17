import { ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

export function manageUpdates(win, debug) {

  autoUpdater.logger.debug(process.env)
  // HACK(mc, 2019-09-10): work around https://github.com/electron-userland/electron-builder/issues/4046
  if (process.env.DESKTOPINTEGRATION === 'AppImageLauncher') {
    // remap temporary running AppImage to actual source
    // THIS IS PROBABLY SUPER BRITTLE AND MAKES ME WANT TO STOP USING APPIMAGE
    autoUpdater.logger.info('rewriting $APPIMAGE', {
      oldValue: process.env.APPIMAGE,
      newValue: process.env.ARGV0,
    })
    process.env.APPIMAGE = process.env.ARGV0
  } else {
    autoUpdater.logger.info('Not running in AppImageLauncher')
  }

  ipcMain.on('updater-ready', () => {
    autoUpdater.checkForUpdates()
    if (debug) {
      win.webContents.send('update-available')
    }
  })

  autoUpdater.on('update-available', () => {
    autoUpdater.downloadUpdate()
  })

  autoUpdater.on('update-downloaded', () => {
    win.webContents.send('update-available')
  })

  ipcMain.on('trigger-update', () => {
    autoUpdater.quitAndInstall()
  })

}