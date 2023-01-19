/**
 * To learn more about Playwright Test visit:
 * https://www.checklyhq.com/docs/browser-checks/playwright-test/
 * https://playwright.dev/docs/writing-tests
 */
const { expect, test } = require('@playwright/test')
const req = require('request-promise')

test('visit page and take screenshot', async ({ page }) => {
  const vercelDeploymentPassword = process.env.PASSWORD_VERCEL

  // If available, we set the target URL to a preview deployment URL provided by the ENVIRONMENT_URL created by Vercel.
  // Otherwise, we use the Production URL.
  const targetUrl = process.env.ENVIRONMENT_URL || 'https://pt.timx.co'
  console.log(process.env)
  const options = {
    uri: targetUrl,
    simple: false,
    resolveWithFullResponse: true
  };
  try {
    const response = await req.post(options).form({ _vercel_password: vercelDeploymentPassword })
    const token = response.headers['set-cookie']
    const tokenString = token.toString().split(';')[0]
    request.headers['Cookie'] = tokenString
  } catch (error) {
    console.log(error)
  }

  // We visit the page. This waits for the "load" event by default.
  const response = await page.goto(targetUrl)

  // Test that the response did not fail
  expect(response.status()).toBeLessThan(400)

  // Take a screenshot
  await page.screenshot({ path: 'screenshot.jpg' })
})
