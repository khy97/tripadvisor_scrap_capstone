const {Builder, By, Key, until} = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > milliseconds){
        break;
      }
    }
  }
 
(async function example() {
  let driver = await new Builder().forBrowser('chrome').build();
  let url = 'http://localhost:3000';
  try {
    await driver.get(url);
    await driver.manage().window().fullscreen();

    let cards = [];
    while(cards.length === 0) {
        cards = await driver.findElements(By.className('export_ticker'));
    }

    for(let index = 0; index < cards.length; index++) {
      let ticker = await cards[index].getText();
      ticker = ticker.substring(ticker.lastIndexOf(' ') + 1);
      console.log(ticker);
      cards[index] = ticker;
    }


    for(let index = 0; index < 10; index++) {
      let ticker = cards[index];
      await driver.navigate().to(`${url}/equities/explore/summary/${ticker}`);
      for(let i = 1; i <= 1; i++) {
        let dropdown = undefined;
        while(dropdown === undefined) {
            try {
                dropdown = await driver.findElement(By.className('for_export_dropdown'));
            }catch(e) {}   
        }
        dropdown.click();
        let options = [];
        while(options.length === 0) {
          options = await driver.findElements(By.className('for_export'));
        }
        await options[i].click();
        let closed = undefined;
        while(closed === undefined) {
            sleep(3);
            try {
                closed = await driver.findElement(By.xpath('//span[text()="Close"]'));
            } catch(e) {}
        }
        closed.click();
      }
    }
  } finally {
    
  }
})();


