<template>
    <li>
        <div class="category-name" v-on:click="show=!show">
            <span class="category-label">{{label}}</span>
            <chevronup-icon decorative title="" v-show="show" />
            <chevrondown-icon decorative title="" v-show="!show" />
        </div>
        <ul class="feeds" v-show="show">
            <li v-for="feed in feeds" :key="feed.id">
                <a href="#" :class="{active: feed.id==selected}" :data-feedid="feed.id" v-on:click="$emit('feedclick', feed.id)">
                    <rss-icon decorative title='' />
                    <span class="feed-title">{{feed.title}}</span>
                    <span class="badge badge-light" v-show="feed.count > 0">{{feed.count}}</span>
                </a>
            </li>
        </ul>
    </li>
</template>

<script>
import RssIcon from "vue-material-design-icons/rss.vue"
import ChevrondownIcon from "vue-material-design-icons/chevron-down.vue"
import ChevronupIcon from "vue-material-design-icons/chevron-up.vue"

export default {
    props: ['label', 'feeds', 'selected'],
    data: function () {
        return {
            show: true
        };
    },
    components: {
        RssIcon,
        ChevrondownIcon,
        ChevronupIcon
    }
}
</script>

<style>
.feeds {
    list-style: none;
    padding: 0;
    display: flex;
    flex-direction: column;
}

.feeds li {
    display: flex;
}

.feeds > li > a {
    display: flex;
    padding: 2px 5px;
    width: 100%;
    color: black;
}

.feeds > li > a:hover, .feeds > li > a:focus, .feeds > li > a.active {
    text-decoration: none;
    color: #fff;
    background-color: #428bca;
}

.feeds > li > a  .feed-title {
    margin-left: 2px;
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    flex: 1;
}

.feeds > li > a  .badge {
    margin-left: 10px;
    margin-right: 2px;
    flex: 0;
    align-self: center;
}

.category-name {
	cursor: default;
	background-color: gainsboro;
	padding: 2px 5px;
    display: flex;
}

.category-name .category-label {
    margin-left: 2px;
    font-weight: bold;
    flex: 1;
}
</style>
