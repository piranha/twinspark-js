#!/usr/bin/env node

const pup = require('puppeteer-core');
const http = require('http');
const fs = require('fs');


function describe(jsHandle) {
  return jsHandle.executionContext().evaluate((obj) => {
    return obj;
    // serialize |obj| however you want
    return `OBJ: ${typeof obj}, ${obj}`;
  }, jsHandle);
}


function delay(t, value) {
  return new Promise(resolve => setTimeout(resolve, t || 0, value));
}


async function timeout(promise, t) {
  var ret = Promise.race([promise, delay(t || 1000, 'timeout')]);
  if (ret == 'timeout')
    throw new Error(ret);
  return ret;
}


const RED =   '\x1b[31m%s\x1b[0m';
const GREEN = '\x1b[32m%s\x1b[0m';


async function runTests(browser, base, url) {
  console.log(`Tests at ${url} ----------------------------------------------`);
  let page = await browser.newPage();
  page.on('console', async msg => {
    if (msg.type() == 'debug')
      return;
    var args = await Promise.all(msg.args().map(describe));
    console.log(msg.type() == 'error' ? RED : '%s',
                args.join(' '))
  });
  page.on('pageerror', e => console.log(e.toString()));

  await page.goto(base + url);
  await page.setViewport({width: 1080, height: 1024});

  var res = new Promise(async resolve => {
    var timeout = setTimeout(async () => {
      console.log('TIMEOUT WAITING FOR TESTS', url);
      await page.close();
      resolve(false);
    }, 2000);

    await page.exposeFunction('headlessRunnerDone', async (success) => {
      clearTimeout(timeout);
      await page.close();
      resolve(success);
    });

    await page.evaluate(() => {
      document.querySelector('#tinytest').addEventListener('tt-done', (e) => {
        console.log('Event:', e.type, 'Success:', e.detail.success);
        setTimeout(() => window.headlessRunnerDone(e.detail.success));
      });
      window.dispatchEvent(new CustomEvent('run-twinspark-tests'));
    });

  });

  return res;
}


function staticHandler(req, res) {
  fs.readFile(req.url.slice(1), (err, data) => {
    if (err) {
      res.writeHead(404, 'Not Found');
      res.write('Not Found');
      return res.end();
    }
    res.writeHead(200);
    res.write(data);
    return res.end();
  });
}


(async () => {
  var path = process.env.CHROMIUM_BIN ||
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
  let browser = await pup.launch({
    headless: true,
    executablePath: path,
  });

  var server = await http.createServer(staticHandler).listen(0);
  var base = 'http://localhost:' + server.address().port;

  var success = await runTests(browser, base, '/test/test.html') &&
      await runTests(browser, base, '/index.html');
  console.log(success ? GREEN : RED, 'TESTS DONE, SUCCESS:' + success);
  await browser.close();
  process.exit(success ? 0 : 1);
})();
