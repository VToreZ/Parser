const User = require('./User/user.js');
const puppeteer = require('puppeteer');
const topDotaArr = [];
let browser, page;

async function getLogins() {
  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();
  const loginSelectors = '[data-a-target="preview-card-channel-link"]';
  await page.goto(`https://www.twitch.tv/directory/game/Dota%202`);
  await page.waitForSelector(loginSelectors, {timeout: 0});

  const topDotaID = await page.$$eval(loginSelectors, links => links.map(name => name.innerText));
  topDotaID.forEach(element => topDotaArr.push(element));
  
  for (let i = 0; i < topDotaArr.length; i++) {
    topDotaArr[i] = new User(topDotaArr[i]);
  };
};

const deferredGet = (page, selector, attempt = 0) => new Promise((res, rej) => {
  page.$eval(selector, selectorIn => +selectorIn.innerText.match(/\d/g).join(''))
    .then(viewersLive => {
      if (viewersLive === 0) {
        if (attempt == 10) res(0);
        setTimeout(() => deferredGet(page, selector, attempt + 1).then(res), 200);
      } else {
        res(viewersLive);
      }
    })
  }
);

let scrape = async (page, login) => {
  const elementSelector = '.tw-animated-number--monospaced';
  await page.goto(`https://www.twitch.tv/${login}`);
  await page.waitForSelector(elementSelector, {timeout: 0});
  const viewersLive = await deferredGet(page, elementSelector);
  return viewersLive
};

const pusher = {
  queue: [],
  pointer: 0,
  maxThreads: 5,
  pages: [],
  activeThreads: 0,
  subsToEnd(f) {
    this.subscribed = f;
  },
  onEnd() {
    if (this.activeThreads > 0) return;
    this.subscribed();
  },
  async start() {
    for (let i = 0; i < this.maxThreads; i++) {
      this.pages.push({
        free: true,
        page: await browser.newPage(),
      });
    }
    this.activeThreads = this.maxThreads;
    for (let i = 0; i < this.maxThreads; i++) {
      this.next();
    }
  },
  enqueue(f) {
    this.queue.push(f);
  },
  async next() {
    if (this.pointer < this.queue.length) {
      const pageIndex = this.pages.findIndex(p => p.free === true);
      this.pages[pageIndex].free = false;
      await this.queue[this.pointer++](this.pages[pageIndex].page);
      this.pages[pageIndex].free = true;
      this.next();
    } else {
      this.activeThreads -= 1;
      this.onEnd();
    }
  }
};

const startTime = Date.now();
getLogins()
  .then(async () => {
    for (let j = 0; j < topDotaArr.length; j++) {
      pusher.enqueue((page) => scrape(page, topDotaArr[j].name)
          .then(value => {
            console.log(`${j+1} of ${topDotaArr.length}`);
            
            topDotaArr[j].viewers = value;
          }))
    };
    pusher.start();
  });

pusher.subsToEnd(() => {
  console.log(`Total time ${Date.now() - startTime}ms`);
  
  console.log(topDotaArr);
  browser.close();
})
