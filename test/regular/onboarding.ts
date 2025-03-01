import { test, useWebdriver } from '../helpers/webdriver';
import { logIn } from '../helpers/webdriver/user';
import { sleep } from '../helpers/sleep';
import { click, focusMain, isDisplayed } from '../helpers/modules/core';

useWebdriver({ skipOnboarding: false });

test('Go through the onboarding and autoconfig', async t => {
  const app = t.context.app;
  await focusMain();

  if (!(await isDisplayed('h2=Live Streaming'))) return;
  await click('h2=Live Streaming');
  await click('button=Continue');

  // Wait for the auth screen to appear
  await (await app.client.$('button=Twitch')).isExisting();

  await logIn(t, 'twitch', { prime: false }, false, true);
  await sleep(1000);

  if (await (await t.context.app.client.$('span=Skip')).isExisting()) {
    await (await t.context.app.client.$('span=Skip')).click();
    await sleep(1000);
  }

  // Don't Import from OBS
  if (await (await t.context.app.client.$('div=Start Fresh')).isExisting()) {
    await (await t.context.app.client.$('div=Start Fresh')).click();
    await sleep(1000);
  }

  // Skip hardware config
  if (await (await t.context.app.client.$('button=Skip')).isExisting()) {
    await (await t.context.app.client.$('button=Skip')).click();
    await sleep(1000);
  }

  // Skip picking a theme
  if (await (await t.context.app.client.$('button=Skip')).isExisting()) {
    await (await t.context.app.client.$('button=Skip')).click();
    await sleep(1000);
  }

  // Start auto config
  // temporarily disable auto config until migrate to new api
  // t.true(await (await app.client.$('button=Start')).isExisting());
  // await (await app.client.$('button=Start')).click();

  // await (await t.context.app.client.$('div=Choose Starter')).waitForDisplayed({ timeout: 60000 });
  // Skip purchasing prime
  if (await (await t.context.app.client.$('div=Choose Starter')).isExisting()) {
    await (await t.context.app.client.$('div=Choose Starter')).click();
    await sleep(1000);
  }

  await (await app.client.$('span=Sources')).waitForDisplayed({ timeout: 60000 });
  // success?
  t.true(await (await app.client.$('span=Sources')).isDisplayed(), 'Sources selector is visible');
});
