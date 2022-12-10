# read-browser-cookies

> Node.js version of `--cookies-from-browser` from yt-dlp

[![Build Status](https://img.shields.io/github/workflow/status/magicdawn/read-browser-cookies/ci/main.svg?style=flat-square)](https://github.com/magicdawn/read-browser-cookies/actions/workflows/ci.yml)
[![Coverage Status](https://img.shields.io/codecov/c/github/magicdawn/read-browser-cookies.svg?style=flat-square)](https://codecov.io/gh/magicdawn/read-browser-cookies)
[![npm version](https://img.shields.io/npm/v/read-browser-cookies.svg?style=flat-square)](https://www.npmjs.com/package/read-browser-cookies)
[![npm downloads](https://img.shields.io/npm/dm/read-browser-cookies.svg?style=flat-square)](https://www.npmjs.com/package/read-browser-cookies)
[![npm license](https://img.shields.io/npm/l/read-browser-cookies.svg?style=flat-square)](http://magicdawn.mit-license.org)

## Install

```sh
$ pnpm add read-browser-cookies
```

## Status

- [x] macOS + Chromium Based browsers
- [ ] macOS + safari
- [ ] macOS + firefox
- [ ] windows + Chromium Based browsers
- [ ] windows + safari
- [ ] windows + firefox
- [ ] Linux + Chromium Based browsers
- [ ] Linux + safari
- [ ] Linux + firefox

current only macOS + Chromium based browsers are supported.

#### chromium based browser names

- chrome
- chromium
- edge
- brave
- opera
- vivaldi

## API

```js
import { readBrowserCookies } from 'read-browser-cookies'

// read all cookies
readBrowserCookies('chrome').then((cookiesArray) => {
  //
})

// read all cookies for specific site
// using sqlite `like %site%`
readBrowserCookies('chrome', { site: 'youtube.com' }).then((cookiesArray) => {
  //
})
```

## Changelog

[CHANGELOG.md](CHANGELOG.md)

## License

the MIT License http://magicdawn.mit-license.org
