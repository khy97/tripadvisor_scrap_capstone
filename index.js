const {Builder, By, Key, until} = require('selenium-webdriver');
var XLSX = require('xlsx');

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addValues( cont, titles, reviews, dates, ratings) {
  let tempTitle = undefined;
  while(tempTitle === undefined) {
    try {
      tempTitle = await cont.findElement(By.className('noQuotes'));
    } catch(e) {};
  }
  tempTitle = await tempTitle.getText();
  titles.push(tempTitle);
  
  let tempReview = undefined;
  while(tempReview === undefined) {
    try {
      tempReview = await cont.findElement(By.className('partial_entry'));
    } catch(e) {};
  }
  tempReview = await tempReview.getText();
  reviews.push(tempReview);
  
  let tempDate = undefined;
  while(tempDate === undefined) {
    try {
      tempDate = await cont.findElement(By.className('ratingDate'));
    } catch(e) {};
  }
  tempDate = await tempDate.getText();
  dates.push(tempDate);

  let tempRating = undefined;
  while(tempRating === undefined) {
    try {
      tempRating = await cont.findElement(By.className('ui_bubble_rating'));
    } catch(e) {};
  }
  let classes = await tempRating.getAttribute('class');
  ratings.push(parseInt(classes.charAt(24)));
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
      } catch(e) {}   
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
    let ratings = [];
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
      await sleep(2000);
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
  
      let tempContainers = [];
      while(tempContainers.length === 0) {
        tempContainers = await driver.findElements(By.className('review-container'));
      }

      for(let cont of tempContainers) {
        let location = undefined;
        let find = 1;
        while(location === undefined && find < 1000) {
          find++;
          try {
            location = await cont.findElement(By.className('userLoc'));
          } catch(e) {};
        }

        if(location !== undefined ) {
          location = await location.getText();
          if(location.toLowerCase().includes('singapore')) {
            await addValues(cont, titles, reviews, dates, ratings);
          }
        } else {
          await addValues(cont, titles, reviews, dates, ratings)
        }
      }
    }
    var wb = XLSX.utils.book_new();
    var ws_name = 'sheet1';

    let ws_data = [[
      'Title', 'Review', 'Date', 'Rating'
    ]];

    for(let ii = 0; ii < titles.length; ii++) {
      let temp = [titles[ii], reviews[ii], dates[ii], ratings[ii]];
      ws_data.push(temp);
    }

    var ws = XLSX.utils.aoa_to_sheet(ws_data);
    XLSX.utils.book_append_sheet(wb, ws, ws_name);
    XLSX.writeFile(wb, 'final.xlsx');
  } finally { }
})();


