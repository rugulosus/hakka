<template>
    <div class="application">
        <div id="navigation-bar">
            <div class="brand">Hakka</div>
            <div class="caption"><span v-show="showFeedCaption">{{selectedFeed.title}}</span></div>
            <div>
                <ul class="command-list">
                    <li><a href="#" v-on:click="renewUnreadCount"><refresh-icon decorative title='Check unread' /></a></li>
                    <li><a href="#"><playlist-check-icon decorative title='Mark as read' /></a></li>
                    <li><a href="#" :class="{active: onlyUnread}" v-on:click="onlyUnread = !onlyUnread"><information-outline-icon decorative title='Unread only' /></a></li>
                    <li><a href="#"><settings-icon decorative title='Settings' /></a></li>
                    <li><a href="#"><account-icon decorative title='Profile' /></a></li>
                    <li><a href="#"><help-circle-outline-icon decorative title='Help' /></a></li>
                </ul>
            </div>
            <div>
                <form class="command-list">
                    <fieldset class="radio-group">
                        <label v-for="item in showOptions" :key="item.value">
                            <input type="radio" v-model="showContents" :value="item.value" />
                            <span>{{item.text}}</span>
                        </label>
                    </fieldset>
                    <fieldset class="search-unit">
                        <input type="search" placeholder="Search" />
                        <button type="submit">Search</button>
                    </fieldset>
                </form>
            </div>
        </div>

        <div id="reader">
            <div id="navigator">
                <ul id="feedlist">
                    <feeds v-for="value in subscriptions" :key="value.id" v-bind="value" :selected="selectedFeed.feedId" v-on:feedclick="loadEntries($event)"></feeds>
                </ul>
            </div>
            <div id="contents" @scroll="scrollContents">
                <div class="feed-caption" v-show="selectedFeed.title != ''">
                    <div class="h2">{{selectedFeed.title}}</div>
                    <a class="link" :href="selectedFeed.url" target="_blank"><open-in-new-icon decorative title=''></open-in-new-icon></a>
                </div>

                <div id="entrylist">
                    <entry v-for="entry in selectedFeed.entries" :key="entry.id" v-bind="entry"></entry>
                </div>

                <div class="continuation-ui">
                    <b-button variant="outline-success" v-show="selectedFeed.continuationId != ''" v-on:click="addEntries">load</b-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import OpenInNewIcon from "vue-material-design-icons/open-in-new.vue"
import RefreshIcon from "vue-material-design-icons/refresh.vue"
import PlaylistCheckIcon from "vue-material-design-icons/playlist-check.vue"
import InformationOutlineIcon from "vue-material-design-icons/information-outline.vue"
import SettingsIcon from "vue-material-design-icons/settings.vue"
import AccountIcon from "vue-material-design-icons/account.vue"
import HelpCircleOutlineIcon from "vue-material-design-icons/help-circle-outline.vue"

import Feeds from './Feeds.vue';
import FeedEntry from './Entry.vue';

const axios = require('@/lib/ResourceAccess.js').default;

export default {
    data: function () {
        return {
            subscriptions: {},
            feeds: {},
            selectedFeed: {
                feedId: "",
                title: "",
                url: "",
                entries: [],
                continuationId: "",
                readEntries: []
            },
            contentsTop: 0,
            entriesTop: 0,
            showContents: "all",
            showOptions: [
                {text: 'All', value: 'all'},
                {text: 'Ellipsis', value: 'ellipsis'},
                {text: 'None', value: 'none'}
            ],
            onlyUnread: false
        };
    },
    provide: function () {
        return {
            showContents: this.showEntryContents,
            onlyUnread: this.showOnlyUnread
        }
    },
    methods: {
        loadSubscriptions: function () {
            this.subscriptions = {};
            axios.get('/subscriptions').then(json => {
                json.data.forEach(feed => {
                    feed.categories.forEach(category => {
                        if ((typeof this.subscriptions[category.id]) == 'undefined') {
                            this.$set(this.subscriptions, category.id, {
                                id: category.id,
                                label: category.label,
                                feeds: Array()
                            });
                        }
                        this.feeds[feed.id] = {
                            id: feed.id,
                            title: feed.title,
                            website: feed.website,
                            count: 0
                        };
                        this.subscriptions[category.id].feeds.push(this.feeds[feed.id]);
                    })
                })
            }).catch(error => this.httpErrorHandler(error))
        },
        renewUnreadCount: function () {
            axios.get('/markers/counts').then(json => {
                json.data.unreadcounts.filter(feed => feed.id.startsWith('feed/')).forEach(feed => {
                    this.feeds[feed.id].count = feed.count;
                });
            });
        },
        loadEntries: function (feedId) {
            this.selectedFeed = {
                feedId: feedId,
                title: '',
                url: '',
                continuationId: '',
                entries: Array()
            }
            document.querySelector('#contents').scrollTop = 0;
            axios.getStreams(feedId, '').then(stream => {
                if (this.selectedFeed.feedId == feedId) {
                    this.selectedFeed = stream;
                }
            });
        },
        addEntries: function (event) {
            event.target.disabled = true;
            axios.getStreams(this.selectedFeed.feedId, this.selectedFeed.continuationId).then(stream => {
                this.selectedFeed.continuationId = stream.continuationId;
                Array.prototype.push.apply(this.selectedFeed.entries, stream.entries);
                event.target.disabled = false;
            });
        },
        scrollContents: function (event) {
            this.contentsTop = event.target.scrollTop;
        },
        showEntryContents: function () {
            return this.showContents;
        },
        showOnlyUnread: function () {
            return this.onlyUnread;
        },
        httpErrorHandler: function (error) {
            if (error.response.status == 401) {
                alert('Unauthorized');
            }
        }
    },
    computed: {
        showFeedCaption: function () {
            return this.contentsTop > this.entriesTop;
        }
    },
    components: {
        feeds: Feeds,
        entry: FeedEntry,
        OpenInNewIcon,
        RefreshIcon,
        PlaylistCheckIcon,
        InformationOutlineIcon,
        SettingsIcon,
        AccountIcon,
        HelpCircleOutlineIcon
    },
    mounted: function () {
        this.loadSubscriptions();
        //this.renewUnreadCount();
        this.entriesTop = document.querySelector('#entrylist').offsetTop;
    }
};
</script>

<style>
.application {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

#navigation-bar {
    display: flex;
    background-color: #343a40;
    padding: 0.5rem 1rem;
}

#navigation-bar .brand {
    color: white;
    font-size: 1.25rem;
    white-space: nowrap;
    margin: auto 1rem auto 0;
    cursor: default;
}

#navigation-bar .caption {
    flex: 1;
    color: white;
    margin: auto 0;
    white-space: nowrap;
    overflow-x: hidden;
    text-overflow: ellipsis;
}

#navigation-bar .command-list {
    display: flex;
    flex-direction: row;
    list-style: none;
    padding-left: 0;
    margin-bottom: 0;
}

#navigation-bar .command-list li {
    line-height: 1.5;
}

#navigation-bar .command-list .radio-group,
#navigation-bar .command-list .search-unit {
    padding: 0.3rem;
}

#navigation-bar .command-list .radio-group input[type="radio"] {
    display: none;
}

#navigation-bar .command-list .radio-group input[type="radio"] + span {
    background-color: #6c757d;
    border: 1px solid #6c757d;
    font-size: 0.875rem;
}

#navigation-bar .command-list .radio-group input[type="radio"]:checked + span,
#navigation-bar .command-list .radio-group input[type="radio"]:hover + span {
    background-color: #545b62;
    border-color: #4e555b;
}

#navigation-bar .command-list .radio-group label:first-child input[type="radio"] + span {
    border-top-left-radius: 0.2rem;
    border-bottom-left-radius: 0.2rem;
}

#navigation-bar .command-list .radio-group label:last-child input[type="radio"] + span {
    border-top-right-radius: 0.2rem;
    border-bottom-right-radius: 0.2rem;
}

#navigation-bar .command-list .radio-group label {
    color: #fff;
    padding: 0;
    margin: 0;
}

#navigation-bar .command-list .radio-group label span {
    padding: 0.2rem 0.4rem;
    display: block;
}

#navigation-bar .command-list a {
    color: rgba(255, 255, 255, 0.5);
    display: block;
    padding: 0.25rem;
    text-decoration: none;
}

#navigation-bar .command-list a:hover {
    color: rgba(255, 255, 255, 0.75);
}

#navigation-bar .command-list a.active {
    color: #fff;
    background-color: #6c757d;
    border: 1px solid #6c757d;
    border-radius: 0.2rem;
    margin: -1px;
}

#navigation-bar .command-list a .material-design-icon {
    font-size: 1.5rem;
}

#navigation-bar .command-list .search-unit input[type="search"] {
    border: 1px solid #ced4da;
    border-radius: 0.2rem;
    padding: 0.2rem 0.5rem;
    font-size: 0.875rem;
}

#navigation-bar .command-list .search-unit button[type="submit"] {
    color: #fff;
    background-color: #6c757d;
    border: 1px solid #6c757d;
    border-radius: 0.2rem;
    padding: 0.2rem 0.4rem;
    font-size: 0.875rem;
}

#navigation-bar .command-list .search-unit button[type="submit"]:hover {
    background-color: #545b62;
    border-color: #4e555b;
}

#reader {
    flex: 1;
    display: flex;
    flex-direction: row;
    flex-basis: 0;
    flex-grow: 1;
    overflow-y: hidden;
    padding: 0;
}

#navigator {
    width: 20%;
    overflow-y: auto;
    overflow-x: hidden;
    background-color: whitesmoke;
}

#contents {
    flex: 1;
}

#feedlist {
    list-style: none;
    padding: 5px 0;
}

#feedlist > li > a {
    padding: 5px 0px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#contents {
    overflow-y: auto;
    overflow-x: hidden;
    padding: 5px;
}

.feed-caption {
    margin: 0 -5px 20px -5px;
    padding: 10px 20px 10px 10px;
    background-color: gainsboro;
    display: flex;
}

.feed-caption .h2 {
    flex: 0;
    white-space: nowrap;
}

.feed-caption .link {
    flex: 0;
    margin: auto 0;
}

#entrylist {
    padding: 0 50px 0 20px;
}

.continuation-ui {
    text-align: center;
    margin: 10px 0 40px 0;
}
</style>
