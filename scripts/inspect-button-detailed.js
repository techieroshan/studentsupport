import { chromium } from 'playwright';

async function inspectButtonDetailed() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  try {
    await page.goto('http://localhost:3003/#/', { waitUntil: 'networkidle' });
    
    const button = await page.locator('#i-want-to-help-button').first();
    await button.waitFor({ state: 'visible', timeout: 10000 });
    
    // Get parent container info
    const parentInfo = await button.evaluate((el) => {
      const parent = el.parentElement;
      if (!parent) return null;
      
      const computed = window.getComputedStyle(parent);
      return {
        tagName: parent.tagName,
        className: parent.className,
        backgroundColor: computed.backgroundColor,
        background: computed.background,
        opacity: computed.opacity,
        zIndex: computed.zIndex,
        position: computed.position,
      };
    });
    
    console.log('Parent Container Info:');
    console.log(JSON.stringify(parentInfo, null, 2));
    
    // Check if button is actually visible (not covered)
    const isVisible = await button.isVisible();
    const isInViewport = await button.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
        visible: rect.width > 0 && rect.height > 0,
      };
    });
    
    console.log('\nButton Visibility:');
    console.log('  isVisible:', isVisible);
    console.log('  Bounding Rect:', isInViewport);
    
    // Get all ancestors and their backgrounds
    const ancestors = await button.evaluate((el) => {
      const result = [];
      let current = el.parentElement;
      let depth = 0;
      while (current && depth < 5) {
        const computed = window.getComputedStyle(current);
        result.push({
          depth,
          tagName: current.tagName,
          className: current.className,
          backgroundColor: computed.backgroundColor,
          opacity: computed.opacity,
          zIndex: computed.zIndex,
        });
        current = current.parentElement;
        depth++;
      }
      return result;
    });
    
    console.log('\nAncestor Elements:');
    console.log(JSON.stringify(ancestors, null, 2));
    
    // Take a focused screenshot of the button area
    const boundingBox = await button.boundingBox();
    if (boundingBox) {
      await page.screenshot({ 
        path: 'button-focused.png', 
        clip: {
          x: boundingBox.x - 50,
          y: boundingBox.y - 50,
          width: boundingBox.width + 100,
          height: boundingBox.height + 100,
        }
      });
      console.log('\nFocused screenshot saved to button-focused.png');
    }
    
    // Check contrast ratio
    const contrast = await button.evaluate((el) => {
      const computed = window.getComputedStyle(el);
      const bg = computed.backgroundColor;
      const fg = computed.color;
      
      // Simple RGB extraction
      const bgMatch = bg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      const fgMatch = fg.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
      
      if (bgMatch && fgMatch) {
        return {
          background: bg,
          foreground: fg,
          bgRGB: [parseInt(bgMatch[1]), parseInt(bgMatch[2]), parseInt(bgMatch[3])],
          fgRGB: [parseInt(fgMatch[1]), parseInt(fgMatch[2]), parseInt(fgMatch[3])],
        };
      }
      return null;
    });
    
    console.log('\nContrast Info:');
    console.log(JSON.stringify(contrast, null, 2));
    
    await browser.close();
  } catch (error) {
    console.error('Error:', error);
    await browser.close();
    process.exit(1);
  }
}

inspectButtonDetailed();

