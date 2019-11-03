
const puppeteer = require('puppeteer');
const User = require('./User/user.js');

const topDotaArr = [];

async function getDotaViewers() {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  const loginSelectors = 'div.preview-card__titles-wrapper.tw-flex-grow-1.tw-flex-shrink-1.tw-full-width > div:nth-child(1) > div > div > p > a';
  const elementSelectors = '.tw-stat__value';
  await page.goto('https://www.twitch.tv/directory/game/Dota%202');
  await page.waitForSelector(loginSelectors, { timeout: 0 });
  topDotaID = await page.$$eval(loginSelectors, (links) => links.map((name) => name.innerText));
  topDotaID.forEach((element) => {
    topDotaArr.push(element);
  });
  await page.close();
  for (let i = 0; i < topDotaArr.length; i += 1) {
    topDotaArr[i] = new User(topDotaArr[i]);
  };
  console.log(topDotaArr);

  for (let i = 0; i < 3; i += 1) {
    for (let j = 0; j < 3; j++) {
      const page = await browser.newPage();
      page.goto(`https://www.twitch.tv/${topDotaArr[i+j].name}`);
      await page.waitForSelector(elementSelectors, { timeout: 0 });
      await page.waitFor(100);
    }
      const viewersLive = await page.$eval(elementSelectors, (selectorIn) => +selectorIn.innerText.match(/\d/g).join(''));
      console.log(viewersLive);

  }
    await browser.close();
}

async function getLogins() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  const loginSelectors = 'div.preview-card__titles-wrapper.tw-flex-grow-1.tw-flex-shrink-1.tw-full-width > div:nth-child(1) > div > div > p > a';
  await page.goto('https://www.twitch.tv/directory/game/Dota%202');
  await page.waitForSelector(loginSelectors, { timeout: 0 });
  const topDotaID = await
  page.$$eval(loginSelectors, (links) => links.map((name) => name.innerText));
  topDotaID.forEach((element) => {
    topDotaArr.push(element);
  });
  for (let i = 0; i < topDotaArr.length; i += 1) {
    topDotaArr[i] = new User(topDotaArr[i]);
  }

  // console.log(topDotaArr.length);
  // console.log(topDotaArr, '-', User.count, 'пользователей.');
  // console.log(icebergdoto.sayHello(qSnake));

  await browser.close();
}

const scrape = async (login) => {
  const start = Date.now();

  const elementSelectors = '.tw-stat__value';
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`https://www.twitch.tv/${login}`);
  await page.waitForSelector(elementSelectors, { timeout: 0 });
  const viewersLive = await page.$eval(elementSelectors, (selectorIn) => +selectorIn.innerText.match(/\d/g).join(''));
  await browser.close();

  const end = Date.now();
  console.log(`Time spended: ${end - start}`);

  return viewersLive;
};

getLogins()
  .then(() => {
    const promises = [];

    for (let j = 0; j < 3; j += 1) {
      promises.push(
        scrape(topDotaArr[j].name)
          .then((value) => {
            topDotaArr[j].viewers = value;
            console.log(topDotaArr[j].name, topDotaArr[j].viewers);
          }),
      );
    }
    return Promise.all(promises);
  })
  .then(() => console.log(topDotaArr, 'Overall Users:', User.count));

// getDotaViewers();
