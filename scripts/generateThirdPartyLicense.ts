/* eslint-disable @typescript-eslint/ban-ts-comment, @typescript-eslint/no-require-imports */
// @ts-nocheck
'use strict'

const path = require('path')
const fs = require('fs')
const thirdPartyChecker = require('./thirdPartyChecker.js')
const repoRoot = path.resolve(__dirname, '..')
const desktopRoot = path.resolve(__dirname, '..', 'packages/desktop')
const preservedLicenses = [
  {
    name: '@marktext/file-icons',
    license: 'MIT',
    text: fs.readFileSync(
      path.resolve(repoRoot, 'licenses', 'MarkText-file-icons-LICENSE.txt'),
      'utf8'
    )
  },
  {
    name: 'MarkText',
    license: 'MIT',
    text: fs.readFileSync(path.resolve(repoRoot, 'licenses', 'MarkText-LICENSE.txt'), 'utf8')
  }
]

const normalizeLicenseText = (text) => text.trim().replace(/[ \t]+$/gm, '')

const readLicenseText = (licenseText, licenseFile) => {
  if (licenseText) {
    return normalizeLicenseText(licenseText)
  }
  if (licenseFile && fs.existsSync(licenseFile)) {
    return normalizeLicenseText(fs.readFileSync(licenseFile, 'utf8'))
  }
  return 'No license text was supplied by this package.'
}

thirdPartyChecker.getLicenses(desktopRoot, (err, packages) => {
  if (err) {
    console.log(`[ERROR] ${err}`)
    return
  }

  let summary = ''
  let licenseList = ''
  let index = 1
  const addedKeys = {}

  Object.keys(packages).forEach((key) => {
    let packageName = key
    const nameRegex = /(^.+)(?:@)/.exec(key)
    if (nameRegex && nameRegex[1]) {
      packageName = nameRegex[1]
    }

    if (Object.hasOwn(addedKeys, packageName)) {
      return
    }
    addedKeys[packageName] = 1

    const { licenses, licenseText, licenseFile } = packages[key]
    summary += `${index++}. ${packageName} (${licenses})\n`
    licenseList += `# ${packageName} (${licenses})
-------------------------------------------------\

${readLicenseText(licenseText, licenseFile)}
\n\n
`
  })

  preservedLicenses.forEach(({ name, license, text }) => {
    summary += `${index++}. ${name} (${license})\n`
    licenseList += `# ${name} (${license})
-------------------------------------------------\

${normalizeLicenseText(text)}
\n\n
`
  })

  const output = `# Third Party Notices
-------------------------------------------------

This file contains all third-party packages that are bundled and shipped with videodown.

-------------------------------------------------
# Summary
-------------------------------------------------

${summary}

-------------------------------------------------
# Licenses
-------------------------------------------------

${licenseList}
`

  fs.writeFileSync(path.resolve(desktopRoot, 'build', 'THIRD-PARTY-LICENSES.txt'), output)
  console.log('THIRD-PARTY-LICENSES.txt generated successfully.')
})
