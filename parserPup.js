const puppeteer = require('puppeteer');
let topDotaArr = [];
async function getLogins() {
  const browser = await puppeteer.launch({headless: true});
  const page = await browser.newPage();
  const loginSelectors = 'div.preview-card__titles-wrapper.tw-flex-grow-1.tw-flex-shrink-1.tw-full-width > div:nth-child(1) > div > div > p > a';
  await page.goto(`https://www.twitch.tv/directory/game/Dota%202`);
  await page.waitForSelector(loginSelectors, {timeout: 0});
  const topDotaID = await page.$$eval(loginSelectors, links => links.map(name => name.innerText));
  topDotaID.forEach(element => topDotaArr.push(element));
  console.log(topDotaArr.length);
  console.log(topDotaArr, topDotaArr.length);

  await browser.close();
};

let scrape = async (login) => {
  let start = Date.now();

  const elementSelectors = '.tw-stat__value';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.twitch.tv/${login}`);
  await page.waitForSelector(elementSelectors, {timeout: 0});
  const viewersLive = await page.$eval(elementSelectors, selectorIn => +selectorIn.innerText.match(/\d/g).join(''));
  await browser.close();

  let end = Date.now();
  console.log(`Time spended: ${end - start}`);

  return viewersLive;
};

new Promise(async function(resolve, reject) {
  await getLogins();
  await resolve();
}).finally(() => {
  for (let j = 0; j < topDotaArr.length - 20; j++) {
    scrape(topDotaArr[j]).then(value => {
      console.log(topDotaArr[j], value);
    });
  };
});
