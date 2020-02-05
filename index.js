const {Builder, By, Key, until} = require('selenium-webdriver');
var XLSX = require('xlsx');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

(async function example() {
  let driver = await new Builder().forBrowser('firefox').build();
  let url = 'https://www.tripadvisor.com.sg/Attraction_Review-g294265-d4089881-Reviews-River_Safari-Singapore.html';
  try {
    await driver.get(url);
    // await driver.manage().window().fullscreen();
    let rating = undefined;
    while(rating === undefined) {
        try {
          rating = await driver.findElement(By.className('reviewCount'));
        }catch(e) {}   
    }
    rating.click();
    
    let lastPage = undefined;
    while(lastPage === undefined) {
        try {
          lastPage = await driver.findElement(By.className('pageNum last '));
        }catch(e) {}   
    }
    
    let last = await lastPage.getAttribute('data-page-number');
    last = parseInt(last);

    let titles = [];
    let reviews = [];
    let dates = [];
    for(let i = 1; i <= last; i++) {
      console.log(`STARTING PAGE ${i}`);
      let pages = [];
      while(pages.length === 0) {
        pages = await driver.findElements(By.className('pageNum'));
      } 

      if(i != 1) {
        for(let page of pages) {
          let number = await page.getAttribute('data-page-number');
          if(parseInt(number) === i) {
            page.click();
            break;
          }
        }
      }

      console.log('SLEEPING FOR PAGE LOAD');
      await sleep(3500);
      console.log('SLEPT WELL');

      console.log('pressing MORE button');
      let moreButtom = undefined;
      let find = 1;
      while(moreButtom === undefined && find < 1000) {
        find++;
        try {
          moreButtom = await driver.findElement(By.className('taLnk ulBlueLinks'));
        } catch(e) {};
      }
      if(moreButtom !== undefined) {
        moreButtom.click();
      }
      console.log('pressed MORE button');

      await sleep(2000);
  
      console.log('GETTING TITLES');
      let tempTitles = [];
      while(tempTitles.length === 0) {
        tempTitles = await driver.findElements(By.className('noQuotes'));
      }
      for(let t of tempTitles) {
        let val = await t.getText();
        titles.push(val);
      }
      console.log("DONE TITLES");
  
      console.log('GETTING REVIEWS');
      let tempReviews = [];
      while(tempReviews.length === 0) {
        tempReviews = await driver.findElements(By.className('partial_entry'));
      }
      for(let t of tempReviews) {
        let val = await t.getText();
        reviews.push(val);
      }
      console.log('DONE REVIEWS');
  
      console.log('GETTING DATES');
      let tempDates = [];
      while(tempDates.length === 0) {
        tempDates = await driver.findElements(By.className('ratingDate'));
      }
      for(let t of tempDates) {
        let val = await t.getText();
        dates.push(val);
      }
      console.log('DONE DATES');
      console.log(`DONE WITH PAGE ${i}`)
    
    }

    var wb = XLSX.utils.book_new();
    var ws_name = 'sheet1';

    let ws_data = [[
      'Title', 'Review', 'Date'
    ]];

    for(let ii = 0; ii < titles.length; ii++) {
      let temp = [titles[ii], reviews[ii], dates[ii]];
      ws_data.push(temp);
    }

    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, 'final.xlsx');
  } finally { }
})();


