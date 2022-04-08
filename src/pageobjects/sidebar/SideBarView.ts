import { ViewContent, ViewTitlePart } from '..'
import {
    PluginDecorator, IPluginDecorator, BasePage, LocatorComponents
} from '../utils'
import { SideBarView as SideBarViewLocators } from '../../locators/1.61.0'

export interface SideBarView<T> extends IPluginDecorator<typeof SideBarViewLocators> { }
/**
 * Page object for the side bar view
 *
 * @category Sidebar
 */
@PluginDecorator(SideBarViewLocators)
export class SideBarView<T> extends BasePage<T> {
    /**
     * @private
     */
    public locatorKey = 'SideBarView' as LocatorComponents

    /**
     * Get the top part of the open view (contains title and possibly some buttons)
     * @returns ViewTitlePart object
     */
    getTitlePart (): ViewTitlePart {
        return this.load(ViewTitlePart, this)
    }

    /**
     * Get the content part of the open view
     * @returns ViewContent object
     */
    getContent (): ViewContent {
        return this.load(ViewContent, this)
    }
}
