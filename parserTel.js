const Code = require('./User/user.js');
const puppeteer = require('puppeteer');
const code3Arr = [];
let browser, page;

async function get3codes() {
  browser = await puppeteer.launch({headless: true});
  page = await browser.newPage();
  const loginSelectors = 'body div.container p:nth-child(11) a' //'[data-a-target="preview-card-channel-link"]';
  await page.goto(`https://codificator.ru/code/mobile/mts.html`);
  await page.waitForSelector(loginSelectors, {timeout: 0});

  const telCode3 = await page.$$eval(loginSelectors, links => links.map(name => name.innerText));
  telCode3.forEach(element => code3Arr.push(element));
  console.log(code3Arr);
  
  for (let i = 0; i < code3Arr.length; i++) {
    code3Arr[i] = new Code(code3Arr[i]);
  };
};

// const deferredGet = (page, selector, attempt = 0) => new Promise((res, rej) => {
//   page.$$eval(selector, selectorIn => selectorIn.map(n => n.firstChild.innerText.match(/www/g).filter(n => n != null)))
//     .then(companyName => {
//       if (companyName === 0) {
//         if (attempt == 10) res(0);
//         setTimeout(() => deferredGet(page, selector, attempt + 1).then(res), 200);
//       } else {
//         res(companyName);
//       }
//     })
//   }
// );

let scrape = async (page, code3) => {
  const elementSelector = 'body div.container div.table-flow table tbody tr';
  const elementSelector2 = 'body div.container div.table-flow.table-mobile-code table tbody tr';
//   const codesSelector = 'body div.container div.table-flow.table-mobile-code2 table tbody tr td span'
  await page.goto(`https://codificator.ru/code/mobile/${code3}`);
  await page.waitForSelector(elementSelector, {timeout: 0});
  let isDefaultPage = await page.$$(elementSelector2).then(
        async ress => {
        //   console.log(ress.length);
          if (!ress.length) {
              
              //   const codes = await page.$$eval(codesSelector, spans => spans.map(span => span.innerText.match(/\d..-..-.x/))).then(res => console.log(res))
                const resultCodes = await page.$$eval(elementSelector, trs => trs.map(tr => ({
                    operator: tr.firstChild.innerText, 
                    codes: Array.from(tr.lastChild.previousSibling.innerHTML.toString().matchAll(/...-..-../gm)).join(' ').split(' '),
                    region: tr.firstChild.nextSibling.innerText
                  })))
                .then(res => res.filter(trObj => trObj.operator == 'МТС').forEach(resObj => resObj.codes.map((c) => {
                    console.log(`${resObj.region}|7${code3 + c.replace(/\D+/g, '')}`);
                    
                })))
                
                return resultCodes
          } else {
            //   console.log('sss' + ress.length);
              
            const resultCodes = await page.$$eval(elementSelector, trs => trs.map(tr => ({
                operator: 'МТС', 
                codes: Array.from(tr.lastChild.previousSibling.innerHTML.toString().matchAll(/...-..-../gm)).join(' ').split(' '),
                region: tr.firstChild.innerText
              })))
            .then((res) => res.forEach(resObj => resObj.codes.map((c) => {
                // console.log(`|${resObj.operator}|${c}`);
                console.log(`${resObj.region}|7${code3 + c.replace(/\D+/g, '')}`);

                
            })))
        
            return resultCodes
          }
      }
      )
      return isDefaultPage
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
get3codes()
  .then(async () => {
    for (let j = 0; j < code3Arr.length; j++) {
      pusher.enqueue((page) => scrape(page, code3Arr[j].name)
          .then(value => {
            // console.log(`${j+1} of ${code3Arr.length}`);
            
            code3Arr[j].operator = value;
          }))
    };
    pusher.start();
  });

pusher.subsToEnd(() => {
  console.log(`Total time ${Date.now() - startTime}ms`);
  
//   console.log(code3Arr);
  browser.close();
})
