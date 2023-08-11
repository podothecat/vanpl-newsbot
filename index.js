require('dotenv').config();
const { WebClient } = require('@slack/web-api');
const web = new WebClient(process.env.BOT_TOKEN);
const sourceChannel = process.env.SOURCE_CHANNEL || "__bot_rss_receive";
const targetChannel = process.env.TARGET_CHANNEL || "bottest";

(async () => {
    const filterHeadlineByKeyword = JSON.parse(process.env.FILTER_HEADLINE_BY_KEYWORD || "false")

    const list = await web.conversations.list();
    const conversation = list.channels.find(e=>e.name === sourceChannel);

    const now = new Date();
    const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate()-1, now.getHours(), 0, 0, 0);
    const historyRet = await web.conversations.history({
        channel: conversation.id,
        count: 1000,
        oldest: yesterday.getTime() / 1000
    })
    
    const news = historyRet.messages.filter(e=>e.subtype === "bot_message");

    const keywordGrouped = news.map(e=>{
        return {
            keyword: e.username.split(" - ")[0].replaceAll("\"", "").replaceAll("\'", ""),
            headline: e.blocks[0].elements[0].elements[2].text,
            link: e.blocks[0].elements[0].elements[2].url,
            source: e.blocks[0].elements[0].elements[3]
        }
    })
    .filter(e=> filterHeadlineByKeyword || e.headline.indexOf(e.keyword) !== -1)
    .reduce((pv, cv) => {
        if (pv.has(cv.keyword)) pv.get(cv.keyword).push(cv)
        else pv.set(cv.keyword, [cv])
        return pv
    }, new Map());

    const headerTxt = `${now.getFullYear()}년 ${now.getMonth()+1}월 ${now.getDate()-1}일 ${now.getHours()}시부터 지금까지 24시간의 뉴스입니다`
    const contentBlocks = [{
        type: 'header',
        text: {"type": "plain_text", "text": headerTxt},
    },{
        type: 'divider',
    }];
    
    keywordGrouped.forEach((value, key)=>{

        const lines = value.map(e=>`• <${e.link}|${e.headline}>`).join("\n")

        const section = {
            type: 'section',
            text: {
                type: "mrkdwn",
                text: `*${key}*\n${lines}`
            }
        }

        contentBlocks.push(section)
    });

    await web.chat.postMessage({
        text: headerTxt,
        channel: targetChannel,
        blocks: contentBlocks,
        mrkdwn: true,
        unfurl_links: false,
        unfurl_media: false,
    })
})();
