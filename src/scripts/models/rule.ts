import { FeedFilter, FilterType } from "./feed"
import { RSSItem } from "./item"

export const enum ItemAction {
    Read = "r", 
    Star = "s", 
    Hide = "h",
}

export type RuleActions = {
    [type in ItemAction]: boolean
}

type ActionTransformType = {
    [type in ItemAction]: (i: RSSItem, f: boolean) => void
}
const actionTransform: ActionTransformType = {
    [ItemAction.Read]: (i, f) => {
        if (f) {
            i.hasRead = true
        } else {
            i.hasRead = false
        }
    },
    [ItemAction.Star]: (i, f) => {
        if (f) {
            i.starred = true
        } else if (i.starred) {
            delete i.starred
        }
    },
    [ItemAction.Hide]: (i, f) => {
        if (f) {
            i.hidden = true
        } else if (i.hidden) {
            delete i.hidden
        }
    }
}

export class SourceRule {
    filter: FeedFilter
    match: boolean
    actions: RuleActions

    constructor(regex: string, actions: RuleActions, fullSearch: boolean, match: boolean) {
        this.filter = new FeedFilter(FilterType.Default, regex)
        if (fullSearch) this.filter.type |= FilterType.FullSearch
        this.match = match
        this.actions = actions
    }

    static apply(rule: SourceRule, item: RSSItem) {
        let result = FeedFilter.testItem(rule.filter, item)
        if (result === rule.match) {
            for (let [action, flag] of Object.entries(rule.actions)) {
                actionTransform[action](item, flag)
            }
        }
    }

    static applyAll(rules: SourceRule[], item: RSSItem) {
        for (let rule of rules) {
            this.apply(rule, item)
        }
    }
}