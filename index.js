let pinyin = require("pinyin");

let express = require('express');
const superagent = require('superagent');
const cheerio = require('cheerio');
let analectsDao = require('./core/analectsDao');

let app = express();
let analects = {};

app.listen(3000, () => {
});

app.get("/", (req, res) => {
    res.send(analects);
})

app.get("/random", (req, res) => {
    let index = Math.floor(Math.random() * analects.length);
    console.log(analects.length, index);
    res.send(analects[index]);
})


function getAnalectChapters(res) {
    let $ = cheerio.load(res.text);
    let chapters = [];
    $("main u").each((idx, ele) => {
        let $ele = $(ele);
        let txt = $ele.text().trim();
        let en = (pinyin(txt.slice(0, -1), {
            style: pinyin.STYLE_NORMAL, // 设置拼音风格
            heteronym: false
        }));
        chapters.push({cn: txt, en: en.join('')});
    });
    return chapters;
}

superagent.get('lunyu.5000yan.com', (err, res) => {
    if (err) {

    } else {
        let chapters = getAnalectChapters(res);
        let promises = [];
        for (const chapter of chapters) {
            let articles = [];
            let url = 'lunyu.5000yan.com/' + chapter.en + '/';
            let p = new Promise((resolve, reject) => {
                superagent.get(url, (err, res) => {
                    if (err) {
                    } else {
                        resolve(res);
                    }
                });
            });
            promises.push(p.then(res => {
                let $ = cheerio.load(res.text);
                $('article').each((idx, ele) => {
                    let content = $(ele).find('h2').text().trim();
                    let translation = $(ele).find('div').text().trim();
                    let index = translation.indexOf('\n');
                    translation = translation.substring(0, index);
                    articles.push({content, translation});
                })
            }));
            analects[chapter.cn] = articles;
        }
        Promise.all(promises).then(
            // 查询结果存库
            // () => analectsDao.save(analects)
        )
    }
});
