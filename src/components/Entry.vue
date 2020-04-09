<template>
    <div class="entry" v-show="showEntry">
        <div class="entry-title">
            <checkbox-icon v-show="unread" />
            <checkbox-outline-icon v-show="!unread" />
            <a class="h4" :href="url" :title="title" target="_blank">{{title}}</a>
        </div>
        <div class="entry-status">
            <span>{{published.toLocaleString()}}</span>
        </div>
        <div :class="['entry-content', showContent]">
            <div v-html="content"></div>
            <img :src="visual" v-show="visual.startsWith('http')" />
        </div>
    </div>
</template>

<script>
import CheckboxIcon from "vue-material-design-icons/checkbox-blank-circle.vue"
import CheckboxOutlineIcon from "vue-material-design-icons/checkbox-blank-circle-outline.vue"

export default {
    props: ['url', 'title', 'content', 'unread', 'visual', 'published'],
    data: function () {
        return {
        };
    },
    inject: ['onlyUnread', 'showContents'],
    components: {
        CheckboxIcon,
        CheckboxOutlineIcon
    },
    computed: {
        showEntry: function () {
            return !this.onlyUnread() || this.unread;
        },
        showContent: function () {
            return this.showContents();
        }
    }
}
</script>

<style>
.entry {
    margin-bottom: 20px;
}

.entry .entry-title {
    border-bottom: 1px solid lightgray;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
}

.entry .entry-title a {
    color: black;
}

.entry .entry-title a:hover, .entry .entry-title a:focus {
    text-decoration: none;
    color: gray;
}

.entry .entry-status {
    text-align: end;
    padding: 0 20px;
}

.entry .entry-content {
    padding: 2px 20px;
}

.entry .entry-content img {
    object-fit: cover;
    margin-left: 5px;
}

.entry .entry-content div {
    flex: 1;
}

.entry .all {
    display: flex;
}

.entry .all img {
    width: 128px;
    height: 128px;
}

.entry .ellipsis {
    display: flex;
    max-height: 200px;
    overflow-y: hidden;
}

.entry .ellipsis img {
    width: 96px;
    height: 96px;
}

.entry .none {
    display: none;
}
</style>
