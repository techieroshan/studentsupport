import { chromium } from 'playwright';

async function inspectButtonScroll() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3003/#/', { waitUntil: 'networkidle' });
    
    const button = await page.locator('#i-want-to-help-button').first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    
    // Scroll to button
    await button.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // Get the actual visual appearance
    const visualInfo = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const rect = el.getBoundingClientRect();
      
      return {
        computed: {
          backgroundColor: computed.backgroundColor,
          color: computed.color,
          background: computed.background,
          opacity: computed.opacity,
          visibility: computed.visibility,
          display: computed.display,
        },
        inline: {
          backgroundColor: el.style.backgroundColor,
          color: el.style.color,
          background: el.style.background,
        },
        position: {
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        },
        classes: el.className,
        id: el.id,
      };
    });
    
    console.log('Button Visual Info:');
    console.log(JSON.stringify(visualInfo, null, 2));
    
    // Take a screenshot of the button area
    const boundingBox = await button.boundingBox();
    if (boundingBox) {
      // Take screenshot of larger area
      await page.screenshot({ 
        path: 'button-area.png', 
        clip: {
          x: Math.max(0, boundingBox.x - 100),
          y: Math.max(0, boundingBox.y - 100),
          width: boundingBox.width + 200,
          height: boundingBox.height + 200,
        }
      });
      console.log('\nScreenshot saved to button-area.png');
    }
    
    // Check if there's any element covering the button
    const coveringElements = await page.evaluate(() => {
      const button = document.getElementById('i-want-to-help-button');
      if (!button) return null;
      
      const rect = button.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const element = document.elementFromPoint(centerX, centerY);
      
      return {
        topElement: element ? {
          tagName: element.tagName,
          id: element.id,
          className: element.className,
          isButton: element === button,
        } : null,
      };
    });
    
    console.log('\nElement at button center:');
    console.log(JSON.stringify(coveringElements, null, 2));
    
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
    process.exit(1);
  }
}

inspectButtonScroll();

