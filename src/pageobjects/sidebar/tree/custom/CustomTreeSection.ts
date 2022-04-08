import { TreeSection } from '../TreeSection'
import { TreeItem } from '../../ViewItem'
import { CustomTreeItem } from './CustomTreeItem'
import { AllViewSectionLocators } from '../../ViewSection'

import { PluginDecorator, IPluginDecorator } from '../../../utils'
import { CustomTreeSection as CustomTreeSectionLocator } from '../../../../locators/1.61.0'

export interface CustomTreeSection extends IPluginDecorator<AllViewSectionLocators> { }
/**
 * Custom tree view, e.g. contributed by an extension
 *
 * @category Sidebar
 */
@PluginDecorator(CustomTreeSectionLocator)
export class CustomTreeSection extends TreeSection {
    /**
     * @private
     */
    public locatorKey = 'CustomTreeSection' as const

    async getVisibleItems (): Promise<TreeItem[]> {
        const items: TreeItem[] = []
        const elements = await this.itemRow$$
        for (const element of elements) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            items.push(await this.load(CustomTreeItem, element as any, this).wait())
        }
        return items
    }

    async findItem (label: string, maxLevel = 0): Promise<TreeItem | undefined> {
        await this.expand()

        const container = await this.rowContainer$
        await container.waitForExist({ timeout: 5000 })

        await container.addValue(['Home'])
        let item: TreeItem | undefined

        const elements = await container.$$(this.locators.itemRow)
        for (const element of elements) {
            const temp = await element.$$(this.locators.rowWithLabel(label))
            if (temp.length > 0) {
                const level = +await temp[0].getAttribute(this.locatorMap.ViewSection.level as string)
                if (maxLevel < 1 || level <= maxLevel) {
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
                    item = await this.load(CustomTreeItem, element as any, this).wait()
                }
            }
        }
        return item
    }
}
