const puppeteer = require('puppeteer');

async function getPic() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const loginSelectors = 'a tw-link--inherit';
  await page.goto('https://www.twitch.tv/directory/game/Dota');
  await page.waitForSelector(loginSelectors, {timeout: 0});
  const topDotaID = await page.$$eval(loginSelectors, links => links.map(name => name.innerText));
  console.log(topDotaID);
  await browser.close();
};

let scrape = async (login) => {
  let start = Date.now();
  const elementSelectors = '.tw-stat__value';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`https://www.twitch.tv/${login}`);
  // window.onload = async function() {
    await page.waitForSelector(elementSelectors, {timeout: 0});

  // const result = await page.evaluate(() => {
  //   let viewerCount = document.querySelector('.tw-stat__value').innerText;
  //   return viewerCount;
  // });
    const viewersLive = await page.$eval(elementSelectors, selectorIn => selectorIn.innerText);
  // };
  await browser.close();
  let end = Date.now();
  console.log(end - start);

  return viewersLive;
};

let loginList = [`Dendi`, `rxnexus`, `dota2mc_ru`,`Dendi`, `rxnexus`, `dota2mc_ru`,`Dendi`];
  for (let i = 0; i < loginList.length; i++) {
    scrape(loginList[i]).then((value) => {
    console.log(loginList[i], value);
  });
};


getPic();
