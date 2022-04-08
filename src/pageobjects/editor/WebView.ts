import { Editor, EditorLocators } from './Editor'
import { PluginDecorator, IPluginDecorator } from '../utils'
import { WebView as WebViewLocators } from '../../locators/1.61.0'

let handle: string | undefined

export interface WebView extends IPluginDecorator<EditorLocators> {}
/**
 * Page object representing an open editor containing a web view
 *
 * @category Editor
 */
@PluginDecorator(WebViewLocators)
export class WebView extends Editor<EditorLocators> {
    /**
     * @private
     */
    public locatorKey = 'WebView' as const

    /**
     * Search for an element inside the webview iframe.
     * Requires webdriver being switched to the webview iframe first.
     * (Will attempt to search from the main DOM root otherwise)
     *
     * @param locator webdriver locator to search by
     * @returns promise resolving to WebElement when found
     */
    async findWebElement (locator: string) {
        return this.elem.$(locator)
    }

    /**
     * Search for all element inside the webview iframe by a given locator
     * Requires webdriver being switched to the webview iframe first.
     * (Will attempt to search from the main DOM root otherwise)
     *
     * @param locator webdriver locator to search by
     * @returns promise resolving to a list of WebElement objects
     */
    async findWebElements (locator: string) {
        return this.elem.$$(locator)
    }

    /**
     * Switch the underlying webdriver context to the webview iframe.
     * This allows using the findWebElement methods.
     * Note that only elements inside the webview iframe will be accessible.
     * Use the switchBack method to switch to the original context.
     */
    async switchToFrame (): Promise<void> {
        if (!handle) {
            handle = await this._driver.getWindowHandle()
        }

        const handles = await this._driver.getWindowHandles()
        for (const h of handles) {
            await this._driver.switchToWindow(h)

            if ((await this._driver.getTitle()).includes('Virtual Document')) {
                await this._driver.switchToFrame(0)
                return
            }
        }
        await this._driver.switchToWindow(handle)

        const reference = await this.elem.$(this.locatorMap.EditorView.webView as string)
        const flowToAttr = await reference.getAttribute('aria-flowto')
        const container = await this._driver.$(`#${flowToAttr}`)
        await container.waitForExist({ timeout: 5000 })

        let tries: WebdriverIO.Element[] = []
        await this._driver.waitUntil(async () => {
            tries = await container.$$(this.locators.iframe)
            if (tries.length > 0) {
                return true
            }
            return false
        }, { timeout: 5000 })
        const view = tries[0]
        await this._driver.switchToFrame(view)

        const frame = await this.activeFrame$
        await frame.waitForExist({ timeout: 5000 })
        await this._driver.switchToFrame(frame)
    }

    /**
     * Switch the underlying webdriver back to the original window
     */
    async switchBack (): Promise<void> {
        if (!handle) {
            handle = await this._driver.getWindowHandle()
        }
        return this._driver.switchToWindow(handle)
    }
}
