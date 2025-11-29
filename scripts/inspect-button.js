import { chromium } from 'playwright';

async function inspectButton() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    // Navigate to the page
    await page.goto('http://localhost:3003/#/', { waitUntil: 'networkidle' });
    
    // Wait for the button to appear
    const button = await page.locator('#i-want-to-help-button').first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    
    // Get computed styles
    const styles = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      return {
        backgroundColor: computed.backgroundColor,
        color: computed.color,
        background: computed.background,
        border: computed.border,
        allStyles: {
          backgroundColor: el.style.backgroundColor,
          color: el.style.color,
          background: el.style.background,
          border: el.style.border,
        },
        classes: el.className,
        id: el.id,
        innerHTML: el.innerHTML,
      };
    });
    
    console.log('Button Styles:');
    console.log(JSON.stringify(styles, null, 2));
    
    // Take a screenshot
    await page.screenshot({ path: 'button-inspection.png', fullPage: false });
    console.log('\nScreenshot saved to button-inspection.png');
    
    // Check if button is visible and what it looks like
    const boundingBox = await button.boundingBox();
    console.log('\nButton Bounding Box:', boundingBox);
    
    // Get all CSS rules affecting this element
    const cssRules = await page.evaluate(() => {
      const button = document.getElementById('i-want-to-help-button');
      if (!button) return null;
      
      const rules = [];
      for (const sheet of document.styleSheets) {
        try {
          for (const rule of sheet.cssRules || []) {
            if (rule.selectorText && button.matches(rule.selectorText)) {
              rules.push({
                selector: rule.selectorText,
                cssText: rule.cssText,
              });
            }
          }
        } catch (e) {
          // Cross-origin stylesheets may throw
        }
      }
      return rules;
    });
    
    console.log('\nCSS Rules affecting button:');
    console.log(JSON.stringify(cssRules, null, 2));
    
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
    process.exit(1);
  }
}

inspectButton();

